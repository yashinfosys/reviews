DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'passwordHash'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'password'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "passwordHash" TO "password";
  END IF;
END $$;
