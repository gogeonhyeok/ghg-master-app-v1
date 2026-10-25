import { joinPond, leavePond, PondError, readPond, speakInPond } from "../../../lib/frogchat/store";
import { MAX_MESSAGE_LENGTH } from "../../../lib/frogchat/types";
import { checkOrigin, sessionTokenPattern } from "../../../lib/frogchat/http";
import { publishPondChange, requireRealtimeConfiguration } from "../../../lib/frogchat/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uuid = sessionTokenPattern;
const headers = { "Cache-Control": "no-store" };

function authenticate(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token || !uuid.test(token)) throw new PondError("Please join the pond first.", 401);
  return token;
}

function failure(error: unknown) {
  if (error instanceof PondError) return Response.json({ error: error.message }, { status: error.status, headers });
  return Response.json({ error: "The pond is temporarily offline. We’ll try again shortly." }, { status: 503, headers });
}

export async function GET(request: Request) {
  try { return Response.json(await readPond(authenticate(request)), { headers }); }
  catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    requireRealtimeConfiguration();
    // Bound the body before parsing, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new PondError("Send a valid pond request.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new PondError("That croak is too long.", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let body: { action?: unknown; text?: unknown; requestId?: unknown } | null;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); }
    catch { throw new PondError("Send a valid pond request.", 400); }
    if (body?.action === "join") {
      const session = await joinPond();
      await publishPondChange();
      return Response.json(session, { status: 201, headers });
    }
    if (body?.action !== "message" || typeof body.text !== "string" ||
      !body.text.trim() || body.text.trim().length > MAX_MESSAGE_LENGTH ||
      typeof body.requestId !== "string" || !uuid.test(body.requestId)) {
      throw new PondError(`Write a croak between 1 and ${MAX_MESSAGE_LENGTH} characters.`, 400);
    }
    const snapshot = await speakInPond(authenticate(request), body.text.trim(), body.requestId);
    await publishPondChange();
    return Response.json(snapshot, { headers });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    await leavePond(authenticate(request));
    await publishPondChange();
    return new Response(null, { status: 204, headers });
  } catch (error) { return failure(error); }
}
