import { afterEach, beforeEach, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import FrogChat from "./FrogChat";
import type { PondMessage, PondSession } from "../../lib/frogchat/types";

const self = { id: "frog-one", name: "Sunny Moss", color: "#87b966", joinedAt: 1000 };
const other = { id: "frog-two", name: "Cozy Fern", color: "#a4bce2", joinedAt: 1001 };
const session: PondSession = { token: "secret-session", selfId: self.id, frogs: [self], messages: [], serverTime: 1000 };
const fetchMock = jest.fn<typeof fetch>();
const originalFetch = global.fetch;
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
  crypto.randomUUID = () => "e3c9925f-3972-4239-ae89-99f7c479e312";
  fetchMock.mockReset();
});
afterEach(() => {
  global.fetch = originalFetch;
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
  await act(async () => { jest.advanceTimersByTime(2000); });
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

it("receives another visitor’s message on the next poll and expires its bubble", async () => {
  const message: PondMessage = { id: "msg-two", frogId: other.id, name: other.name, color: other.color, text: "Ribbit from Fern", sentAt: 3000 };
  fetchMock.mockImplementation((_url, options) => respond(options?.method === "GET"
    ? { ...session, frogs: [self, other], messages: [message], serverTime: Date.now() }
    : session));
  const view = render(<FrogChat />);
  await act(async () => {});
  await act(async () => { jest.advanceTimersByTime(2000); });
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
