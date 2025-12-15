import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../database/prisma.js";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, emailNotifications, pushNotifications } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const dataToUpdate: {
      name?: string;
      emailNotifications?: boolean;
      pushNotifications?: boolean;
    } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (emailNotifications !== undefined)
      dataToUpdate.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined)
      dataToUpdate.pushNotifications = pushNotifications;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailNotifications: true,
        pushNotifications: true,
        googleSub: true,
      },
    });

    return res.status(200).json({
      ...user,
      isGoogleAuthUser: Boolean(user.googleSub),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const deletedUser = await prisma.user.delete({ where: { id: userId } });
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
