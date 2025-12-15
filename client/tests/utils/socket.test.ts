import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { socket } from "@/utils/socket";

describe("Socket", () => {
  beforeEach(() => {
    vi.spyOn(socket, "connect").mockImplementation(() => socket);
    vi.spyOn(socket, "disconnect").mockImplementation(() => socket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe existir el socket", () => {
    expect(socket).toBeDefined();
  });

  it("debe tener la propiedad autoConnect en false", () => {
    expect(socket.io.opts.autoConnect).toBe(false);
  });

  it("debe tener withCredentials en true", () => {
    expect(socket.io.opts.withCredentials).toBe(true);
  });

  it("debe poder conectarse", () => {
    socket.connect();
    expect(socket.connect).toHaveBeenCalled();
  });

  it("debe poder desconectarse", () => {
    socket.disconnect();
    expect(socket.disconnect).toHaveBeenCalled();
  });
});
