/*
  Warnings:

  - The values [SALESPERSON] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- First, update all existing SALESPERSON values
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE text;
UPDATE "User" SET "role" = 'SELLER' WHERE "role" = 'SALESPERSON';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'SELLER');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'SELLER';
COMMIT;
