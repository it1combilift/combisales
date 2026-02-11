-- Migrate existing role values to roles array
-- This converts single role values to array format [role]
UPDATE "User"
SET "roles" = ARRAY["role"::"Role"]
WHERE "role" IS NOT NULL AND ("roles" IS NULL OR "roles" = '{}');
