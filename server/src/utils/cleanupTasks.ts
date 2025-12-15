import prisma from "../database/prisma.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function cleanupOldCompletedTasks(): Promise<number> {
  try {
    const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS);

    const result = await prisma.task.deleteMany({
      where: {
        status: "COMPLETED",
        completedAt: {
          lte: sevenDaysAgo,
        },
      },
    });
    return result.count;
  } catch (error) {
    return 0;
  }
}

export function startCleanupJob(): void {
  cleanupOldCompletedTasks();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  setInterval(cleanupOldCompletedTasks, ONE_HOUR_MS);
}
