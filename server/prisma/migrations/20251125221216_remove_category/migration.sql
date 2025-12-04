/*
  Warnings:

  - You are about to drop the column `categoryId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category_shares` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `listId` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_listId_fkey";

-- DropForeignKey
ALTER TABLE "category_shares" DROP CONSTRAINT "category_shares_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "category_shares" DROP CONSTRAINT "category_shares_userId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_categoryId_fkey";

-- DropIndex
DROP INDEX "tasks_categoryId_idx";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "categoryId",
ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listId" TEXT NOT NULL;

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "category_shares";

-- CreateIndex
CREATE INDEX "tasks_listId_idx" ON "tasks"("listId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
