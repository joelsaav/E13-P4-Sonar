import nodemailer from "nodemailer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendNotificationEmail } from "../../src/utils/emailService";

vi.mock("nodemailer");

describe("emailService", () => {
  const originalEnv = process.env;
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    process.env = { ...originalEnv };
    consoleLogSpy.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("Configuración faltante", () => {
    it("Retorna void (implícitamente undefined) si EMAIL_USER o EMAIL_PASSWORD no están definidos", async () => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;

      const result = await sendNotificationEmail(
        "test@test.com",
        "User",
        "SYSTEM",
        "Title",
        "Description",
      );

      expect(result).toBeUndefined();
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });
  });

  describe("Envío de emails", () => {
    beforeEach(() => {
      process.env.EMAIL_USER = "test@test.com";
      process.env.EMAIL_PASSWORD = "password";
    });

    it("Envía email correctamente", async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: "123" });
      const mockTransporter = { sendMail: mockSendMail };
      vi.mocked(nodemailer.createTransport).mockReturnValue(
        mockTransporter as never,
      );

      await sendNotificationEmail(
        "recipient@test.com",
        "Test User",
        "SYSTEM",
        "Test Title",
        "Test Description",
      );

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: "gmail",
        auth: {
          user: "test@test.com",
          pass: "password",
        },
      });
      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      process.env.EMAIL_USER = "test@test.com";
      process.env.EMAIL_PASSWORD = "password";
    });

    it("Usa color por defecto para tipo de notificación desconocido", async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: "123" });
      const mockTransporter = { sendMail: mockSendMail };
      vi.mocked(nodemailer.createTransport).mockReturnValue(
        mockTransporter as never,
      );

      await sendNotificationEmail(
        "test@test.com",
        "User",
        "UNKNOWN_TYPE" as any,
        "Title",
        "Description",
      );

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("#6366f1");
    });
  });
});
