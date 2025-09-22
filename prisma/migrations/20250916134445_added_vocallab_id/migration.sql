/*
  Warnings:

  - Added the required column `vocalLabsId` to the `Agents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Agents" ADD COLUMN     "vocalLabsId" TEXT NOT NULL;
