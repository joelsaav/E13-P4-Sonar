import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { Request, Response } from "express";

export const chatController = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "No messages provided" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const result = streamText({
      model: google(process.env.GEMINI_MODEL || "gemini-1.5-flash"),
      messages,
      system: `Eres un asistente útil para TaskGrid, una aplicación de gestión de tareas colaborativa.
Tu objetivo es ayudar a los usuarios a entender cómo usar la aplicación.

Características principales de TaskGrid:
- Crear y organizar tareas con prioridades
- Compartir listas y tareas con equipos
- Configurar notificaciones y recordatorios
- Dashboard con estadísticas y gráficos
- Colaboración en tiempo real con Socket.IO

Responde de manera concisa y útil en el idioma del usuario.`,
    });

    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    return res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Error processing chat request",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
    res.end();
    return;
  }
};
