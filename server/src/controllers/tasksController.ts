import { Request, Response } from "express";
import prisma from "../database/prisma";
import { TaskPriority, TaskStatus } from "../types/task";
import { SharePermission } from "@prisma/client";
import { createNotification } from "./notificationsController";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { name, description, status, listId, priority, dueDate } = req.body;
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
    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.delete({
      where: {
        id,
      },
    });
    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting task" });
  }
};

export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
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
    const { id } = req.params;
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

    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;
    if (status) dataToUpdate.status = status;
    if (listId) dataToUpdate.listId = listId;
    if (priority) dataToUpdate.priority = priority;
    if (dueDate) dataToUpdate.dueDate = dueDate;
    if (favorite) dataToUpdate.favorite = favorite;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const task = await prisma.task.update({
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
    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating task" });
  }
};

export const shareTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;
    const userId = req.user?.id;

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

    const task = await prisma.task.update({
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
      where: { id: req.user?.id },
      select: { name: true },
    });
    await createNotification(
      userToShare.id,
      "GENERAL",
      "Nueva tarea compartida",
      `${currentUser?.name || "Alguien"} te ha compartido la tarea "${task.name}"`,
      currentUser?.name || "Usuario",
    );
    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error sharing task" });
  }
};

export const updateSharePermission = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
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
    const task = await prisma.task.update({
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

    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating share permission" });
  }
};

export const unshareTask = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    // First check if the share exists to avoid errors
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

    const task = await prisma.task.update({
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

    return res.json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error unsharing task" });
  }
};
