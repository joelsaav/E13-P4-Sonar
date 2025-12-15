import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import prisma from "../database/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { createNotification } from "./notificationsController.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const oauth = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export const register = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    await createNotification(
      user.id,
      "SYSTEM",
      "¡Bienvenido a Task Grid!",
      "Gracias por unirte a nuestra plataforma. Esperamos que disfrutes organizando tus tareas.",
      "Sistema",
    );

    const token = generateToken({ userId: user.id });

    return res.status(201).json({ user, token });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A user with this email already exists." });
    }
    console.error(error);
    return res.status(500).json({ error: "Error creating user." });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid email." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Wrong password." });
    }

    const token = generateToken({ userId: user.id });

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        image: user.image,
        isGoogleAuthUser: Boolean(user.googleSub),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error logging in user." });
  }
};

export async function googleSignIn(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  if (!oauth) {
    return res
      .status(500)
      .json({ error: "Google authentication not configured" });
  }

  try {
    const ticket = await oauth!.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.email_verified || !payload?.sub) {
      return res.status(400).json({ error: "Invalid Google credentials" });
    }

    const { email, sub: googleSub, name, picture } = payload;

    let user = await prisma.user.findFirst({ where: { googleSub } });
    if (!user) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { googleSub },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split("@")[0],
            password: null,
            googleSub,
            image: picture,
            emailVerifiedAt: new Date(),
          },
        });

        await createNotification(
          user.id,
          "SYSTEM",
          "¡Bienvenido a Task Grid!",
          "Gracias por unirte a nuestra plataforma. Esperamos que disfrutes organizando tus tareas.",
          "Sistema",
        );
      }
    }

    const token = generateToken({ userId: user.id });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        isGoogleAuthUser: Boolean(user.googleSub),
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ error: "Failed to authenticate with Google" });
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.googleSub || !user.password) {
      return res
        .status(400)
        .json({ error: "Cannot change password for OAuth (Google) users" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
