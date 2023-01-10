/*
  Warnings:

  - You are about to drop the `User_MailTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('verification', 'passwordReset');

-- DropForeignKey
ALTER TABLE "User_MailTokens" DROP CONSTRAINT "User_MailTokens_userId_fkey";

-- DropTable
DROP TABLE "User_MailTokens";

-- DropEnum
DROP TYPE "MailTokenType";

-- CreateTable
CREATE TABLE "User_Tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_Tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Tokens_id_key" ON "User_Tokens"("id");

-- AddForeignKey
ALTER TABLE "User_Tokens" ADD CONSTRAINT "User_Tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
