/*
  Warnings:

  - You are about to drop the column `completed` on the `tasks` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."tasks_dueDate_idx";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "completed";
