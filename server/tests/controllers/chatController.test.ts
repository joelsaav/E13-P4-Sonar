import { streamText } from "ai";
import { Request, Response } from "express";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { chatController } from "../../src/controllers/chatController";

vi.mock("ai", () => ({
  streamText: vi.fn(),
  openai: vi.fn(),
}));

describe("ChatController", () => {
  let mockReq: Partial<Request>;
  let mockRes: any;
  let statusMock: Mock;
  let jsonMock: Mock;

  beforeEach(() => {
    mockReq = {
      body: {
        messages: [{ role: "user", content: "Hello" }],
      },
    };

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockRes = {
      status: statusMock,
      write: vi.fn(),
      end: vi.fn(),
      setHeader: vi.fn(),
      headersSent: false,
    };

    vi.clearAllMocks();
  });

  it("should stream text successfully", async () => {
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield "Hello";
        yield " world";
      },
    };

    (streamText as Mock).mockReturnValue({
      textStream: mockStream,
    });

    await chatController(mockReq as Request, mockRes as Response);

    expect(mockRes.write).toHaveBeenCalledTimes(3);
    expect(mockRes.end).toHaveBeenCalled();
  });

  it("should return 400 if no messages are provided", async () => {
    mockReq.body.messages = [];

    await chatController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: "No messages provided" }),
    );
  });

  it("should return 500 if error occurs before headers are sent", async () => {
    (streamText as Mock).mockImplementation(() => {
      throw new Error("API Error");
    });

    await chatController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Error processing chat request" }),
    );
  });

  it("should return 500 with 'Unknown error' if thrown value is not an Error", async () => {
    (streamText as Mock).mockImplementation(() => {
      throw "Some string error";
    });

    await chatController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Error processing chat request",
        message: "Unknown error",
      }),
    );
  });

  it("should end response if error occurs after headers are sent", async () => {
    mockRes.write.mockImplementation(() => {
      mockRes.headersSent = true;
    });

    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield "Chunk 1";
        throw new Error("Stream failed");
      },
    };

    (streamText as Mock).mockReturnValue({
      textStream: mockStream,
    });

    await chatController(mockReq as Request, mockRes as Response);

    expect(mockRes.write).toHaveBeenCalledWith(
      expect.stringContaining("Chunk 1"),
    );
    expect(statusMock).not.toHaveBeenCalledWith(500);
    expect(mockRes.end).toHaveBeenCalled();
  });
});
