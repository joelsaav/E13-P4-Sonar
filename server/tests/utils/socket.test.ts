import { Request, Response } from "express";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { Server } from "socket.io";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("../../src/database/prisma", () => ({
  default: {
    list: {
      findUnique: vi.fn(),
    },
    task: {
      create: vi.fn(),
    },
  },
}));

describe("Socket Configuration", () => {
  let httpServer: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    httpServer = {} as any;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should initialize socket.io with default CORS origin if CLIENT_URL is not set", async () => {
    delete process.env.CLIENT_URL;

    vi.doMock("socket.io", () => {
      return {
        Server: vi.fn().mockImplementation(function () {
          return { on: vi.fn() };
        }),
      };
    });

    const { initSocket } = await import("../../src/utils/socket");
    initSocket(httpServer);

    const { Server: MockServer } = await import("socket.io");

    expect(MockServer).toHaveBeenCalledWith(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
      },
    });

    vi.doUnmock("socket.io");
  });
});

describe("Socket Integration", () => {
  let httpServer: any;
  let port: number;
  let clientSocket: any;

  beforeAll(async () => {
    vi.doUnmock("socket.io");
    vi.resetModules();

    httpServer = createServer();
    const { initSocket } = await import("../../src/utils/socket");
    initSocket(httpServer);

    return new Promise<void>((resolve) => {
      httpServer.listen(() => {
        port = (httpServer.address() as any).port;
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow users to join user", async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        clientSocket?.disconnect();
        reject(new Error("Test timeout"));
      }, 3000);
      clientSocket = Client(`http://localhost:${port}`);
      const userId = "test-user-123";
      clientSocket.on("connect", () => {
        clientSocket.emit("join_user", userId);

        setTimeout(() => {
          clearTimeout(timeout);
          clientSocket.disconnect();
          resolve();
        }, 100);
      });
      clientSocket.on("error", (error: any) => {
        clearTimeout(timeout);
        clientSocket.disconnect();
        reject(error);
      });
    });
  });

  it("should allow users to join and leave list", async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        clientSocket?.disconnect();
        reject(new Error("Test timeout"));
      }, 3000);
      clientSocket = Client(`http://localhost:${port}`);
      const listId = "test-list-456";
      clientSocket.on("connect", () => {
        clientSocket.emit("join_list", listId);
        setTimeout(() => {
          clientSocket.emit("leave_list", listId);
          setTimeout(() => {
            clearTimeout(timeout);
            clientSocket.disconnect();
            resolve();
          }, 100);
        }, 100);
      });
      clientSocket.on("error", (error: any) => {
        clearTimeout(timeout);
        clientSocket.disconnect();
        reject(error);
      });
    });
  });

  it("should handle disconnect event", async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Test timeout"));
      }, 3000);
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on("connect", () => {
        clientSocket.disconnect();
      });
      clientSocket.on("disconnect", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  });
});

describe("Socket getIO", () => {
  it("should return initialized socket instance", async () => {
    const { getIO } = await import("../../src/utils/socket");
    const io = getIO();
    expect(io).toBeDefined();
    expect(io.sockets).toBeDefined();
  });

  it("should throw error if not initialized", async () => {
    vi.resetModules();
    const { getIO } = await import("../../src/utils/socket");
    expect(() => getIO()).toThrow("Socket.io not initialized!");
  });
});
