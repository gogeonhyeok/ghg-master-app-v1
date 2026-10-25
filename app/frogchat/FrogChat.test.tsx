import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import FrogChat from "./FrogChat";
import type { PondMessage, PondSession, PondSnapshot } from "../../lib/frogchat/types";

const self = { id: "frog-one", name: "Sunny Moss", color: "#87b966", joinedAt: 1000 };
const other = { id: "frog-two", name: "Cozy Fern", color: "#a4bce2", joinedAt: 1001 };
const session: PondSession = { token: "secret-session", selfId: self.id, frogs: [self], messages: [], serverTime: 1000 };
const fetchMock = jest.fn<typeof fetch>();
const originalFetch = global.fetch;
const originalWebSocket = global.WebSocket;
class PondSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: PondSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  events: unknown[] = [];
  constructor(public url: URL) {
    PondSocket.instances.push(this);
    void Promise.resolve().then(() => { this.readyState = 1; this.onopen?.(); });
  }
  send(data: string) {
    const event = JSON.parse(data);
    this.events.push(event);
    if (event.type === "authenticate" || event.type === "heartbeat") this.snapshot({ ...session, serverTime: Date.now() });
  }
  snapshot(snapshot: PondSnapshot) { this.onmessage?.({ data: JSON.stringify({ type: "snapshot", snapshot }) }); }
  close(code = 1000) { this.readyState = 3; this.onclose?.({ code }); }
}

const originalRandomUUID = crypto.randomUUID;
const originalAudioContext = global.AudioContext;
function mockAudio(resume = () => Promise.resolve()) {
  const start = jest.fn();
  const stop = jest.fn();
  const createBufferSource = jest.fn(() => ({
    buffer: null, onended: null, connect: jest.fn(), disconnect: jest.fn(), start, stop,
  }));
  const context = {
    state: "running", sampleRate: 44100, currentTime: 0, destination: {},
    resume: jest.fn(resume), close: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    createBuffer: (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
    createBufferSource,
    createGain: () => ({
      connect: jest.fn(), disconnect: jest.fn(),
      gain: { cancelScheduledValues: jest.fn(), setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
    }),
  };
  const create = jest.fn(() => context);
  global.AudioContext = create as unknown as typeof AudioContext;
  return { context, create, start, stop };
}

function respond(data: unknown, status = 200) {
  return Promise.resolve({ ok: status < 400, status, json: async () => data } as Response);
}

beforeEach(() => {
  jest.useFakeTimers({ now: 1000 });
  global.fetch = fetchMock;
  global.WebSocket = PondSocket as unknown as typeof WebSocket;
  PondSocket.instances = [];
  crypto.randomUUID = () => "e3c9925f-3972-4239-ae89-99f7c479e312" as const;
  fetchMock.mockReset();
});
afterEach(() => {
  global.fetch = originalFetch;
  global.WebSocket = originalWebSocket;
  crypto.randomUUID = originalRandomUUID;
  global.AudioContext = originalAudioContext;
  jest.useRealTimers();
});

it("previews sound only after enabling it and stops playback when muted", async () => {
  const { context, create, start, stop } = mockAudio();
  const message: PondMessage = { id: "sound-message", frogId: other.id, name: other.name, color: other.color, text: "Ribbit!", sentAt: 3000 };
  fetchMock.mockImplementation((_url, options) => respond(options?.method === "GET"
    ? { ...session, frogs: [self, other], messages: [message], serverTime: Date.now() }
    : session));
  const view = render(<FrogChat />);
  await act(async () => {});
  expect(create).not.toHaveBeenCalled();
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Sound off" })); });
  expect(screen.getByRole("button", { name: "Sound on" }).getAttribute("aria-pressed")).toBe("true");
  expect(context.createBufferSource).toHaveBeenCalledTimes(1);
  expect(start).toHaveBeenCalledTimes(1);
  await act(async () => {
    jest.advanceTimersByTime(2000);
    PondSocket.instances[0].snapshot({ ...session, frogs: [self, other], messages: [message], serverTime: Date.now() });
  });
  expect(context.createBufferSource).toHaveBeenCalledTimes(2);
  await act(async () => { jest.advanceTimersByTime(2000); });
  expect(context.createBufferSource).toHaveBeenCalledTimes(2);
  const stopsBeforeMuting = stop.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Sound on" }));
  expect(stop).toHaveBeenCalledTimes(stopsBeforeMuting + 1);
  expect(screen.getByRole("button", { name: "Sound off" }).getAttribute("aria-pressed")).toBe("false");
  view.unmount();
  expect(context.close).toHaveBeenCalledTimes(1);
});

it("does not play a delayed preview after sound has been turned off", async () => {
  let resume!: () => void;
  const { context } = mockAudio(() => new Promise<void>(resolve => { resume = resolve; }));
  fetchMock.mockImplementation(() => respond(session));
  const view = render(<FrogChat />);
  await act(async () => {});
  fireEvent.click(screen.getByRole("button", { name: "Sound off" }));
  fireEvent.click(screen.getByRole("button", { name: "Sound on" }));
  await act(async () => { resume(); });
  expect(context.createBufferSource).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Sound off" })).toBeTruthy();
  view.unmount();
});

it("leaves sound off when the browser cannot enable audio", async () => {
  const { context } = mockAudio(() => Promise.reject(new Error("Audio unavailable")));
  fetchMock.mockImplementation(() => respond(session));
  const view = render(<FrogChat />);
  await act(async () => {});
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Sound off" })); });
  expect(screen.getByRole("alert").textContent).toContain("Croak sounds aren’t available");
  expect(screen.getByRole("button", { name: "Sound off" }).getAttribute("aria-pressed")).toBe("false");
  expect(context.createBufferSource).not.toHaveBeenCalled();
  view.unmount();
});

it("automatically joins and shows a croaking frog and bubble when a message is sent", async () => {
  const message: PondMessage = { id: "msg-one", frogId: self.id, name: self.name, color: self.color, text: "Hello, pond!", sentAt: 1000 };
  fetchMock.mockImplementation((_url, options) => {
    const body = options?.body ? JSON.parse(String(options.body)) : {};
    return respond(body.action === "message" ? { ...session, messages: [message] } : session);
  });
  const view = render(<FrogChat />);
  await act(async () => {});
  expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ action: "join" }));
  expect(screen.getByLabelText(`${self.name}, your frog`)).toBeTruthy();
  const input = screen.getByRole("textbox", { name: "Your message to everyone in the pond" });
  fireEvent.change(input, { target: { value: "Hello, pond!" } });
  await act(async () => { fireEvent.submit(input.closest("form")!); });
  const frog = screen.getByLabelText(`${self.name}, your frog`);
  expect(within(frog).getByText("Hello, pond!")).toBeTruthy();
  expect(frog.querySelector(".croaking")).toBeTruthy();
  expect(within(screen.getByRole("log")).getByText("Hello, pond!")).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe("");
  view.unmount();
  expect(fetchMock.mock.calls.at(-1)?.[1]).toMatchObject({ method: "DELETE", keepalive: true });
});

it("shows a failed join instead of silently leaving the pond empty, then clears it on reconnect", async () => {
  fetchMock.mockImplementationOnce(() => respond({ error: "The pond is temporarily offline." }, 503));
  fetchMock.mockImplementation(() => respond(session));
  const view = render(<FrogChat />);
  await act(async () => {});
  expect(screen.getByRole("alert").textContent).toContain("The pond is temporarily offline.");
  expect(screen.queryByLabelText(`${self.name}, your frog`)).toBeNull();
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.getByLabelText(`${self.name}, your frog`)).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  view.unmount();
});

it("receives another visitor’s message over the socket and expires its bubble", async () => {
  const message: PondMessage = { id: "msg-two", frogId: other.id, name: other.name, color: other.color, text: "Ribbit from Fern", sentAt: 3000 };
  fetchMock.mockImplementation((_url, options) => respond(options?.method === "GET"
    ? { ...session, frogs: [self, other], messages: [message], serverTime: Date.now() }
    : session));
  const view = render(<FrogChat />);
  await act(async () => {});
  await act(async () => {
    jest.advanceTimersByTime(2000);
    PondSocket.instances[0].snapshot({ ...session, frogs: [self, other], messages: [message], serverTime: Date.now() });
  });
  const frog = screen.getByLabelText(other.name);
  expect(within(frog).getByText(message.text)).toBeTruthy();
  expect(frog.querySelector(".croaking")).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(1200); });
  expect(frog.querySelector(".croaking")).toBeNull();
  for (let second = 0; second < 9; second++) {
    await act(async () => { jest.advanceTimersByTime(1000); });
  }
  expect(within(frog).queryByText(message.text)).toBeNull();
  expect(within(screen.getByRole("log")).getByText(message.text)).toBeTruthy();
  view.unmount();
});

it("preserves a failed draft and reuses its message ID on retry", async () => {
  let attempts = 0;
  fetchMock.mockImplementation((_url, options) => {
    const body = options?.body ? JSON.parse(String(options.body)) : {};
    if (body.action === "message") {
      attempts++;
      if (attempts === 1) return Promise.reject(new Error("offline"));
    }
    return respond(session);
  });
  const view = render(<FrogChat />);
  await act(async () => {});
  const input = screen.getByRole("textbox", { name: "Your message to everyone in the pond" });
  fireEvent.change(input, { target: { value: "Keep my croak" } });
  await act(async () => { fireEvent.submit(input.closest("form")!); });
  expect(screen.getByRole("alert").textContent).toContain("Try sending it again");
  expect((input as HTMLInputElement).value).toBe("Keep my croak");
  await act(async () => { fireEvent.submit(input.closest("form")!); });
  const sends = fetchMock.mock.calls.filter(call => String(call[1]?.body).includes('"action":"message"'));
  expect(sends[0][1]?.body).toEqual(sends[1][1]?.body);
  expect((input as HTMLInputElement).value).toBe("");
  view.unmount();
});

it("keeps a socket subscription alive without HTTP polling and closes it on unmount", async () => {
  fetchMock.mockImplementation(() => respond(session));
  const view = render(<FrogChat />);
  await act(async () => {});
  const socket = PondSocket.instances[0];
  expect(socket.url.pathname).toBe("/api/frogchat/ws");
  expect(socket.events[0]).toEqual({ type: "authenticate", token: session.token });
  await act(async () => { jest.advanceTimersByTime(60_000); });
  expect(socket.events.filter((event: unknown) => (event as { type: string }).type === "heartbeat")).toHaveLength(2);
  expect(fetchMock.mock.calls).toHaveLength(1);
  view.unmount();
  expect(socket.readyState).toBe(3);
  await act(async () => { jest.advanceTimersByTime(60_000); });
  expect(PondSocket.instances).toHaveLength(1);
});

it("reconnects to the same session after a dropped connection", async () => {
  fetchMock.mockImplementation(() => respond(session));
  const view = render(<FrogChat />);
  await act(async () => {});
  await act(async () => { PondSocket.instances[0].close(1006); });
  expect(screen.getByText("Reconnecting", { exact: true })).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(1300); });
  expect(PondSocket.instances).toHaveLength(2);
  expect(PondSocket.instances[1].events[0]).toEqual({ type: "authenticate", token: session.token });
  expect(screen.getByText("Connected", { exact: true })).toBeTruthy();
  expect(fetchMock.mock.calls).toHaveLength(1);
  view.unmount();
});

it("joins again when the socket reports an expired session", async () => {
  fetchMock.mockImplementation(() => respond(session));
  const view = render(<FrogChat />);
  await act(async () => {});
  await act(async () => {
    PondSocket.instances[0].onmessage?.({ data: JSON.stringify({ type: "error", status: 401, message: "Expired" }) });
  });
  expect(PondSocket.instances).toHaveLength(2);
  expect(fetchMock.mock.calls.filter(call => String(call[1]?.body).includes('"action":"join"'))).toHaveLength(2);
  view.unmount();
});
