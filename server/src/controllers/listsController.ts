import { Request, Response } from "express";
import prisma from "../database/prisma.js";
import { SharePermission } from "@prisma/client";
import { createNotification } from "./notificationsController.js";
import { getIO } from "../utils/socket.js";

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

    getIO().to(`user:${ownerId}`).emit("list:created", list);

    return res.status(200).json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating list" });
  }
};

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const list = await getListWithPermissions(id, userId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    if (!hasListPermission(list, userId, SharePermission.ADMIN)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.list.delete({
      where: {
        id,
      },
    });

    getIO().to(`list:${id}`).emit("list:deleted", id);

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

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const list = await getListWithPermissions(id, userId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    if (!hasListPermission(list, userId, SharePermission.EDIT)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, description } = req.body;

    const dataToUpdate: {
      name?: string;
      description?: string;
    } = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const listUpdated = await prisma.list.update({
      where: {
        id,
      },
      data: dataToUpdate,
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

    getIO().to(`list:${id}`).emit("list:updated", listUpdated);

    return res.status(200).json(listUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating list" });
  }
};

export const shareList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const list = await getListWithPermissions(id, userId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    if (!hasListPermission(list, userId, SharePermission.ADMIN)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { email, permission } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.id === userId) {
      return res.status(400).json({ error: "Cannot share list with yourself" });
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

    const listUpdated = await prisma.list.update({
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
      "SHARED",
      "Nueva lista compartida",
      `${currentUser?.name || "Alguien"} te ha compartido la lista "${listUpdated.name}"`,
      currentUser?.name || "Usuario",
    );

    getIO().to(`user:${user.id}`).emit("list:shared", listUpdated);

    return res.status(200).json(listUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sharing list" });
  }
};

export const unshareList = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const list = await getListWithPermissions(id, currentUserId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    if (currentUserId !== userId) {
      if (!hasListPermission(list, currentUserId, SharePermission.ADMIN)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const listUpdated = await prisma.list.update({
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

    getIO().to(`user:${userId}`).emit("list:unshared", id);

    return res.status(200).json(listUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error unsharing list" });
  }
};

export const updateSharePermission = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const list = await getListWithPermissions(id, currentUserId);
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    if (!hasListPermission(list, currentUserId, SharePermission.ADMIN)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { permission } = req.body;

    const listUpdated = await prisma.list.update({
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

    return res.status(200).json(listUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating share permission" });
  }
};

const getListWithPermissions = async (listId: string, userId: string) => {
  return prisma.list.findUnique({
    where: { id: listId },
    include: {
      shares: {
        where: { userId },
      },
    },
  });
};

const hasListPermission = (
  list: any,
  userId: string,
  requiredPermission: SharePermission,
) => {
  if (list.ownerId === userId) return true;

  const share = list.shares[0];
  if (!share) return false;

  return checkLevel(share.permission) >= checkLevel(requiredPermission);
};

const checkLevel = (permission: SharePermission) => {
  const levels = {
    [SharePermission.VIEW]: 1,
    [SharePermission.EDIT]: 2,
    [SharePermission.ADMIN]: 3,
  };

  return levels[permission];
};
