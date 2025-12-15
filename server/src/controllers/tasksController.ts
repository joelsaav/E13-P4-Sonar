import { Request, Response } from "express";
import prisma from "../database/prisma.js";
import { TaskPriority, TaskStatus } from "../types/task.js";
import { SharePermission } from "@prisma/client";
import { createNotification } from "./notificationsController.js";
import { getIO } from "../utils/socket.js";

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description, status, listId, priority, dueDate } = req.body;

    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        shares: {
          where: { userId },
        },
      },
    });
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    if (list.ownerId !== userId) {
      const share = list.shares[0];
      if (!share || share.permission === SharePermission.VIEW) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        status,
        listId,
        priority,
        dueDate,
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
        list: true,
      },
    });

    getIO().to(`list:${listId}`).emit("task:created", task);

    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    const task = await getTaskWithPermissions(id, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (!task.list) return res.status(404).json({ error: "List not found" });

    if (!hasPermission(task, userId, SharePermission.ADMIN, true)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.task.delete({
      where: {
        id,
      },
    });

    getIO().to(`list:${task.listId}`).emit("task:deleted", id);

    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting task" });
  }
};

export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        list: {
          ownerId: userId,
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
        list: true,
      },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error getting tasks" });
  }
};

export const getSharedTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          {
            shares: {
              some: {
                userId: userId,
              },
            },
          },
          {
            list: {
              shares: {
                some: {
                  userId: userId,
                },
              },
            },
          },
        ],
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
        list: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error getting shared tasks" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    const task = await getTaskWithPermissions(id, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (!task.list) return res.status(404).json({ error: "List not found" });

    if (!hasPermission(task, userId, SharePermission.EDIT)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { name, description, status, listId, priority, dueDate, favorite } =
      req.body;
    const dataToUpdate: {
      name?: string;
      description?: string;
      status?: TaskStatus;
      listId?: string;
      priority?: TaskPriority;
      dueDate?: string;
      favorite?: boolean;
    } = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status;
    if (listId !== undefined) dataToUpdate.listId = listId;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (dueDate !== undefined) dataToUpdate.dueDate = dueDate;
    if (favorite !== undefined) dataToUpdate.favorite = favorite;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const taskUpdated = await prisma.task.update({
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
        list: true,
      },
    });

    getIO().to(`list:${taskUpdated.listId}`).emit("task:updated", taskUpdated);

    return res.status(200).json(taskUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating task" });
  }
};

export const shareTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { id } = req.params;

    const task = await getTaskWithPermissions(id, userId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (!task.list) return res.status(404).json({ error: "List not found" });

    if (!hasPermission(task, userId, SharePermission.ADMIN)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { email, permission } = req.body;

    const userToShare = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userToShare) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToShare.id === userId) {
      return res.status(400).json({ error: "Cannot share task with yourself" });
    }

    const taskUpdated = await prisma.task.update({
      where: {
        id,
      },
      data: {
        shares: {
          create: {
            userId: userToShare.id,
            permission: permission || SharePermission.VIEW,
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
        list: true,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    await createNotification(
      userToShare.id,
      "SHARED",
      "Nueva tarea compartida",
      `${currentUser?.name || "Alguien"} te ha compartido la tarea "${taskUpdated.name}"`,
      currentUser?.name || "Usuario",
    );

    return res.status(200).json(taskUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sharing task" });
  }
};

export const updateSharePermission = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const originalUserId = req.user?.id;
    if (!originalUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const task = await getTaskWithPermissions(id, originalUserId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (!task.list) return res.status(404).json({ error: "List not found" });

    if (!hasPermission(task, originalUserId, SharePermission.ADMIN)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { permission } = req.body;

    const share = await prisma.taskShare.findUnique({
      where: {
        taskId_userId: {
          taskId: id,
          userId,
        },
      },
    });
    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    const taskUpdated = await prisma.task.update({
      where: {
        id,
      },
      data: {
        shares: {
          update: {
            where: {
              taskId_userId: {
                taskId: id,
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
        list: true,
      },
    });

    return res.status(200).json(taskUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating share permission" });
  }
};

export const unshareTask = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const originalUserId = req.user?.id;
    if (!originalUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (originalUserId !== userId) {
      const task = await getTaskWithPermissions(id, originalUserId);
      if (!task) return res.status(404).json({ error: "Task not found" });
      if (!task.list) return res.status(404).json({ error: "List not found" });

      if (!hasPermission(task, originalUserId, SharePermission.ADMIN)) {
        return res.status(403).json({ error: "Unauthorized" });
      }
    }

    const share = await prisma.taskShare.findUnique({
      where: {
        taskId_userId: {
          taskId: id,
          userId,
        },
      },
    });

    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    const taskUpdated = await prisma.task.update({
      where: {
        id,
      },
      data: {
        shares: {
          delete: {
            taskId_userId: {
              taskId: id,
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
        list: true,
      },
    });

    return res.status(200).json(taskUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error unsharing task" });
  }
};

const getTaskWithPermissions = async (taskId: string, userId: string) => {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      list: {
        include: {
          shares: {
            where: { userId },
          },
        },
      },
      shares: {
        where: { userId },
      },
    },
  });
};

const hasPermission = (
  task: any,
  userId: string,
  requiredPermission: SharePermission,
  requireListPermission: boolean = false,
) => {
  if (task.list.ownerId === userId) return true;

  const listShare = task.list.shares[0];
  const taskShare = task.shares[0];

  if (listShare) {
    if (checkLevel(listShare.permission) >= checkLevel(requiredPermission))
      return true;
  }

  if (requireListPermission) return false;

  if (taskShare) {
    if (checkLevel(taskShare.permission) >= checkLevel(requiredPermission)) {
      return true;
    }
  }

  return false;
};

const checkLevel = (permission: SharePermission) => {
  const levels = {
    [SharePermission.VIEW]: 1,
    [SharePermission.EDIT]: 2,
    [SharePermission.ADMIN]: 3,
  };

  return levels[permission];
};
