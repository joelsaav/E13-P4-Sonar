import { Request, Response } from "express";
import prisma from "../database/prisma";
import { createNotification } from "./notificationsController";

export const createList = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const list = await prisma.list.create({
      data: {
        name,
        description,
        ownerId,
      },
      include: {
        shares: true,
        tasks: true,
      },
    });
    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating list" });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = await prisma.list.delete({
      where: {
        id,
      },
    });
    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting list" });
  }
};

export const getUserLists = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const lists = await prisma.list.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        shares: true,
        tasks: true,
      },
    });
    return res.status(200).json(lists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error getting lists" });
  }
};

export const getSharedLists = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const lists = await prisma.list.findMany({
      where: {
        shares: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        shares: true,
        tasks: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return res.status(200).json(lists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error getting shared lists" });
  }
};

export const updateList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const dataToUpdate: {
      name?: string;
      description?: string;
    } = {};
    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    const list = await prisma.list.update({
      where: {
        id,
      },
      data: dataToUpdate,
      include: {
        shares: true,
        tasks: true,
      },
    });
    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating list" });
  }
};

export const shareList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingShare = await prisma.listShare.findUnique({
      where: {
        listId_userId: {
          listId: id,
          userId: user.id,
        },
      },
    });
    if (existingShare) {
      return res
        .status(400)
        .json({ error: "List already shared with this user" });
    }
    const list = await prisma.list.update({
      where: {
        id,
      },
      data: {
        shares: {
          create: {
            userId: user.id,
            permission: permission || "VIEW",
          },
        },
      },
      include: {
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        tasks: true,
      },
    });
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { name: true },
    });
    await createNotification(
      user.id,
      "GENERAL",
      "Nueva lista compartida",
      `${currentUser?.name || "Alguien"} te ha compartido la lista "${list.name}"`,
      currentUser?.name || "Usuario",
    );
    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sharing list" });
  }
};

export const unshareList = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const list = await prisma.list.update({
      where: {
        id,
      },
      data: {
        shares: {
          delete: {
            listId_userId: {
              listId: id,
              userId,
            },
          },
        },
      },
      include: {
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        tasks: true,
      },
    });
    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error unsharing list" });
  }
};

export const updateSharePermission = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const { permission } = req.body;

    const list = await prisma.list.update({
      where: {
        id,
      },
      data: {
        shares: {
          update: {
            where: {
              listId_userId: {
                listId: id,
                userId,
              },
            },
            data: {
              permission,
            },
          },
        },
      },
      include: {
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        tasks: true,
      },
    });

    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating share permission" });
  }
};
