import { upgradeWebSocket } from "@vercel/functions";
import { checkOrigin } from "../../../../lib/frogchat/http";
import { requireRealtimeConfiguration } from "../../../../lib/frogchat/realtime";
import { acceptPondSocket } from "../../../../lib/frogchat/socket";
import { PondError } from "../../../../lib/frogchat/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    checkOrigin(request, true);
    if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return Response.json({ error: "Connect with a WebSocket client." }, { status: 426 });
    }
    requireRealtimeConfiguration();
    return await upgradeWebSocket(acceptPondSocket, { maxPayload: 4096 });
  } catch (error) {
    return Response.json({ error: error instanceof PondError ? error.message : "The pond connection is unavailable. Check its realtime configuration." }, {
      status: error instanceof PondError ? error.status : 503,
    });
  }
}
