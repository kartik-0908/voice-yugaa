/*
  Warnings:

  - You are about to drop the column `vocalLabsId` on the `agents` table. All the data in the column will be lost.
  - Added the required column `bolnaId` to the `agents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."agents" DROP COLUMN "vocalLabsId",
ADD COLUMN     "bolnaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Voices" (
    "id" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vocallabsId" TEXT NOT NULL,

    CONSTRAINT "Voices_pkey" PRIMARY KEY ("id")
);
