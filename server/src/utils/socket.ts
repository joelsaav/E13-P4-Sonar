import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_list", (listId: string) => {
      socket.join(`list:${listId}`);
    });

    socket.on("join_user", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("leave_list", (listId: string) => {
      socket.leave(`list:${listId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
