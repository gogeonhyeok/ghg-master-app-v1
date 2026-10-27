import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import FrogChat from "./FrogChat";
import type { PondSession, PondSnapshot } from "../../lib/frogchat/types";

const self = { id: "one", name: "Sunny Moss", color: "#87b966", joinedAt: 100_000, x: 50, facing: 1 as const, jumpedAt: 0 };
const other = { ...self, id: "two", name: "Cozy Fern", x: 38 };
const session: PondSession = { token: "private-session", selfId: self.id, frogs: [self, other], messages: [], serverTime: 100_000 };
const fetchMock = jest.fn<typeof fetch>();
const originalFetch = global.fetch;
const originalSocket = global.WebSocket;
const originalUuid = crypto.randomUUID;
class Socket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: Socket[] = [];
  readyState = 0;
  events: { type: string; direction?: number; token?: string }[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(public url: URL) {
    Socket.instances.push(this);
    void Promise.resolve().then(() => { this.readyState = 1; this.onopen?.(); });
  }
  send(raw: string) {
    const event = JSON.parse(raw); this.events.push(event);
    if (event.type === "authenticate" || event.type === "heartbeat") this.snapshot({ ...session, serverTime: Date.now() });
  }
  snapshot(snapshot: PondSnapshot) { this.onmessage?.({ data: JSON.stringify({ type: "snapshot", snapshot }) }); }
  receive(event: unknown) { this.onmessage?.({ data: JSON.stringify(event) }); }
  close(code = 1000) { this.readyState = 3; this.onclose?.({ code }); }
}
function respond(value: unknown, status = 200) { return Promise.resolve({ ok: status < 400, status, json: async () => value } as Response); }
beforeEach(() => {
  jest.useFakeTimers({ now: 100_000 });
  global.fetch = fetchMock; global.WebSocket = Socket as unknown as typeof WebSocket;
  crypto.randomUUID = () => "e3c9925f-3972-4239-ae89-99f7c479e312" as const;
  Socket.instances = []; fetchMock.mockReset(); fetchMock.mockImplementation(() => respond(session));
});
afterEach(() => { global.fetch = originalFetch; global.WebSocket = originalSocket; crypto.randomUUID = originalUuid; jest.useRealTimers(); });

it("joins a single room with the supplied frog and leaves on exit", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  expect(screen.getByRole("region", { name: "Shared frog room" })).toBeTruthy();
  expect(screen.getByLabelText("Sunny Moss, your frog").querySelector('image')?.getAttribute("href")).toBe("/frogchat/frog.svg");
  expect(screen.getByRole("log", { name: "Message history" })).toBeTruthy();
  expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ action: "join", pond: "classic" }));
  view.unmount();
  expect(Socket.instances[0].readyState).toBe(3);
  expect(fetchMock.mock.calls.at(-1)?.[1]).toMatchObject({ method: "DELETE", keepalive: true });
});

it("shows sent messages above the frog for exactly three seconds and keeps history", async () => {
  fetchMock.mockImplementation((_url, options) => {
    const body = JSON.parse(String(options?.body || "{}"));
    return respond(body.action === "message" ? { ...session, messages: [{ id: "hello", frogId: self.id, name: self.name, color: self.color, text: body.text, sentAt: Date.now() }], serverTime: Date.now() } : session);
  });
  const view = render(<FrogChat />); await act(async () => {});
  const input = screen.getByRole("textbox", { name: "Your message" });
  fireEvent.change(input, { target: { value: "Hello everyone" } });
  await act(async () => { fireEvent.submit(input.closest("form")!); });
  const frog = screen.getByLabelText("Sunny Moss, your frog");
  expect(within(frog).getByText("Hello everyone")).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(2999); });
  expect(within(frog).getByText("Hello everyone")).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(2); });
  expect(within(frog).queryByText("Hello everyone")).toBeNull();
  expect(within(screen.getByRole("log")).getByText("Hello everyone")).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe("");
  view.unmount();
});

it("uses socket frames for held movement and jumping, then stops on release or blur", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  const socket = Socket.instances[0];
  fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });
  await act(async () => { jest.advanceTimersByTime(450); });
  fireEvent.keyDown(window, { key: " ", code: "Space" });
  expect(socket.events.filter(event => event.type === "move")).toHaveLength(4);
  expect(socket.events.at(-1)).toMatchObject({ type: "jump", seq: 5, jumpId: expect.any(String) });
  fireEvent.keyUp(window, { key: "ArrowRight", code: "ArrowRight" });
  const count = socket.events.length;
  await act(async () => { jest.advanceTimersByTime(600); });
  expect(socket.events).toHaveLength(count);
  fireEvent.keyDown(window, { key: "ArrowLeft", code: "ArrowLeft" });
  fireEvent.blur(window);
  const afterBlur = socket.events.length;
  await act(async () => { jest.advanceTimersByTime(600); });
  expect(socket.events).toHaveLength(afterBlur);
  expect(fetchMock.mock.calls).toHaveLength(1);
  view.unmount();
});

it("does not hijack arrows or Space while typing", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  const input = screen.getByRole("textbox", { name: "Your message" });
  fireEvent.keyDown(input, { key: "ArrowLeft", code: "ArrowLeft" });
  fireEvent.keyDown(input, { key: " ", code: "Space" });
  expect(Socket.instances[0].events).toEqual([{ type: "authenticate", token: session.token }]);
  fireEvent.click(screen.getByRole("button", { name: "Move left" }));
  fireEvent.click(screen.getByRole("button", { name: "Jump" }));
  expect(Socket.instances[0].events.slice(-2)).toMatchObject([{ type: "move", direction: -1, seq: 1 }, { type: "jump", seq: 2, jumpId: expect.any(String) }]);
  view.unmount();
});

it("renders a remote frog’s position, direction and jump without jumping again on later snapshots", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  await act(async () => {
    Socket.instances[0].snapshot({ ...session, frogs: [self, { ...other, x: 65, facing: -1, jumpedAt: 100_000 }], serverTime: 100_000 });
  });
  const frog = screen.getByLabelText("Cozy Fern");
  expect((frog as HTMLElement).style.left).toBe("65%");
  expect(frog.querySelector('[data-facing="-1"]')).toBeTruthy();
  expect(frog.querySelector(".jumping")).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(651); });
  expect(frog.querySelector(".jumping")).toBeNull();
  await act(async () => { Socket.instances[0].snapshot({ ...session, frogs: [self, { ...other, jumpedAt: 100_000 }], serverTime: Date.now() }); });
  expect(frog.querySelector(".jumping")).toBeNull();
  view.unmount();
});

it("keeps a failed draft and reuses its ID when retried", async () => {
  let messages = 0;
  fetchMock.mockImplementation((_url, options) => {
    const body = JSON.parse(String(options?.body || "{}"));
    if (body.action === "message" && ++messages === 1) return Promise.reject(new Error("Offline"));
    return respond(session);
  });
  const view = render(<FrogChat />); await act(async () => {});
  const input = screen.getByRole("textbox", { name: "Your message" });
  fireEvent.change(input, { target: { value: "Keep this" } });
  await act(async () => { fireEvent.submit(input.closest("form")!); });
  expect(screen.getByRole("alert")).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe("Keep this");
  await act(async () => { fireEvent.submit(input.closest("form")!); });
  const sends = fetchMock.mock.calls.filter(call => String(call[1]?.body).includes('"action":"message"'));
  expect(sends[0][1]?.body).toBe(sends[1][1]?.body);
  view.unmount();
});

it("recovers dropped sockets without polling and disables controls until connected", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  await act(async () => { Socket.instances[0].close(1006); });
  expect((screen.getByRole("button", { name: "Jump" }) as HTMLButtonElement).disabled).toBe(true);
  await act(async () => { jest.advanceTimersByTime(1300); });
  expect(Socket.instances).toHaveLength(2);
  expect((screen.getByRole("button", { name: "Jump" }) as HTMLButtonElement).disabled).toBe(false);
  await act(async () => { jest.advanceTimersByTime(50_000); });
  expect(fetchMock.mock.calls).toHaveLength(1);
  view.unmount();
});

it("retries a failed join and clears its error on connection", async () => {
  fetchMock.mockImplementationOnce(() => respond({ error: "Room unavailable" }, 503));
  const view = render(<FrogChat />); await act(async () => {});
  expect(screen.getByRole("alert").textContent).toBe("Room unavailable");
  await act(async () => { jest.advanceTimersByTime(1100); });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByLabelText("Sunny Moss, your frog")).toBeTruthy();
  view.unmount();
});

it("predicts immediately, replays unacknowledged inputs, and corrects rejected moves", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  const socket = Socket.instances[0];
  const frog = screen.getByLabelText("Sunny Moss, your frog") as HTMLElement;
  fireEvent.click(screen.getByRole("button", { name: "Move right" }));
  expect(frog.style.left).toBe("52.5%"); // No server response has arrived.
  await act(async () => { jest.advanceTimersByTime(150); });
  fireEvent.click(screen.getByRole("button", { name: "Move right" }));
  expect(frog.style.left).toBe("55%");
  await act(async () => {
    socket.receive({ type: "ack", seq: 1, accepted: true, frog: { ...self, x: 52.5, motionVersion: 1 }, serverTime: Date.now() });
  });
  expect(frog.style.left).toBe("55%"); // Input #2 is still pending.
  await act(async () => { socket.snapshot({ ...session, serverTime: Date.now() }); });
  expect(frog.style.left).toBe("55%"); // Old snapshot cannot undo prediction.
  await act(async () => {
    socket.receive({ type: "ack", seq: 2, accepted: false, frog: { ...self, x: 52.5, motionVersion: 1 }, serverTime: Date.now() });
  });
  expect(frog.style.left).toBe("52.5%");
  await act(async () => { socket.snapshot({ ...session, serverTime: Date.now() }); });
  expect(frog.style.left).toBe("52.5%"); // Nor can it undo a confirmed newer version.
  view.unmount();
});

it("starts a jump immediately and keeps the same animation when its acknowledgement arrives", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  fireEvent.click(screen.getByRole("button", { name: "Jump" }));
  const frog = screen.getByLabelText("Sunny Moss, your frog");
  const jumping = frog.querySelector(".jumping");
  expect(jumping).toBeTruthy();
  expect(jumping?.querySelector(".name")?.textContent).toContain("You");
  const input = Socket.instances[0].events.at(-1)!;
  await act(async () => {
    jest.advanceTimersByTime(200);
    Socket.instances[0].receive({ type: "ack", seq: 1, accepted: true, frog: { ...self, jumpedAt: 100_050, jumpId: (input as { jumpId?: string }).jumpId, motionVersion: 1 }, serverTime: Date.now() });
  });
  expect(frog.querySelector(".jumping")).toBe(jumping);
  await act(async () => { jest.advanceTimersByTime(700); });
  expect(frog.querySelector(".jumping")).toBeNull();
  view.unmount();
});

it("merges small remote updates and ignores late older movement versions", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  const socket = Socket.instances[0];
  await act(async () => {
    socket.receive({ type: "motion", frog: { ...other, x: 65, motionVersion: 2 }, serverTime: Date.now() });
    socket.receive({ type: "motion", frog: { ...other, x: 60, motionVersion: 1 }, serverTime: Date.now() });
    socket.snapshot({ ...session, serverTime: Date.now() });
  });
  expect((screen.getByLabelText("Cozy Fern") as HTMLElement).style.left).toBe("65%");
  expect(Socket.instances).toHaveLength(1);
  expect(fetchMock.mock.calls).toHaveLength(1);
  view.unmount();
});

it("discards pending prediction on reconnect and recovers the server position", async () => {
  const view = render(<FrogChat />); await act(async () => {});
  const frog = screen.getByLabelText("Sunny Moss, your frog") as HTMLElement;
  fireEvent.click(screen.getByRole("button", { name: "Move right" }));
  expect(frog.style.left).toBe("52.5%");
  await act(async () => { Socket.instances[0].close(1006); });
  expect(frog.style.left).toBe("50%");
  await act(async () => { jest.advanceTimersByTime(1300); });
  expect(frog.style.left).toBe("50%");
  view.unmount();
});

it("shows a pending bubble before a slow message save and removes it on failure", async () => {
  let reject!: (error: Error) => void;
  const delayed = new Promise<Response>((_resolve, fail) => { reject = fail; });
  fetchMock.mockImplementation((_url, options) => JSON.parse(String(options?.body || "{}")).action === "message" ? delayed : respond(session));
  const view = render(<FrogChat />); await act(async () => {});
  const input = screen.getByRole("textbox", { name: "Your message" });
  fireEvent.change(input, { target: { value: "Instant hello" } });
  fireEvent.submit(input.closest("form")!);
  const frog = screen.getByLabelText("Sunny Moss, your frog");
  expect(within(frog).getByText("Instant hello")).toBeTruthy();
  expect(within(screen.getByRole("log")).getByText("Sending…")).toBeTruthy();
  await act(async () => { reject(new Error("Offline")); });
  expect(within(frog).queryByText("Instant hello")).toBeNull();
  expect(within(screen.getByRole("log")).queryByText("Instant hello")).toBeNull();
  expect((input as HTMLInputElement).value).toBe("Instant hello");
  view.unmount();
});

it("does not restart the three-second bubble when a delayed save finally succeeds", async () => {
  let save!: (response: Response) => void;
  const delayed = new Promise<Response>(resolve => { save = resolve; });
  fetchMock.mockImplementation((_url, options) => JSON.parse(String(options?.body || "{}")).action === "message" ? delayed : respond(session));
  const view = render(<FrogChat />); await act(async () => {});
  const input = screen.getByRole("textbox", { name: "Your message" });
  fireEvent.change(input, { target: { value: "Slow save" } });
  fireEvent.submit(input.closest("form")!);
  const frog = screen.getByLabelText("Sunny Moss, your frog");
  await act(async () => { jest.advanceTimersByTime(3001); });
  expect(within(frog).queryByText("Slow save")).toBeNull();
  await act(async () => {
    save(await respond({ ...session, serverTime: Date.now(), messages: [{ id: `${self.id}:${crypto.randomUUID()}`, frogId: self.id, name: self.name, color: self.color, text: "Slow save", sentAt: Date.now() }] }));
  });
  expect(within(frog).queryByText("Slow save")).toBeNull();
  expect(within(screen.getByRole("log")).getByText("Slow save")).toBeTruthy();
  expect(within(screen.getByRole("log")).queryByText("Sending…")).toBeNull();
  view.unmount();
});
