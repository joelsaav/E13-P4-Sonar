import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

const createTransporter = (): Transporter | null => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const generateNotificationEmailHTML = (
  userName: string,
  notificationTitle: string,
  notificationDescription: string,
  notificationType: string,
): string => {
  const typeColors: Record<string, string> = {
    SYSTEM: "#6366f1",
    SHARED: "#8b5cf6",
    EXPIRED: "#ef4444",
  };

  const color = typeColors[notificationType] || "#6366f1";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Notificación - TaskGrid</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${color}; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">TaskGrid</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Sistema de Gestión de Tareas</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 20px;">Hola, ${userName}</h2>
              <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 14px;">Tienes una nueva notificación:</p>
              
              <!-- Notification Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-left: 4px solid ${color}; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="margin-bottom: 8px;">
                      <span style="display: inline-block; background-color: ${color}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                        ${notificationType}
                      </span>
                    </div>
                    <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${notificationTitle}</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${notificationDescription}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Ver en TaskGrid
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px 0; color: #9ca3af; font-size: 12px;">
                © 2025 Equipo 13 - TaskGrid. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                Puedes desactivar las notificaciones por email en tu configuración.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

export const sendNotificationEmail = async (
  userEmail: string,
  userName: string,
  notificationType: "SYSTEM" | "SHARED" | "EXPIRED",
  title: string,
  description: string,
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const htmlContent = generateNotificationEmailHTML(
      userName,
      title,
      description,
      notificationType,
    );

    const mailOptions = {
      from: `"TaskGrid Notificaciones" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `TaskGrid: ${title}`,
      html: htmlContent,
      text: `${title}\n\n${description}\n\nVer más en TaskGrid: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
    };

    await transporter?.sendMail(mailOptions);
  } catch (error) {}
};
