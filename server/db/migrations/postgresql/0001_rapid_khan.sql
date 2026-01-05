ALTER TABLE "users" ADD COLUMN "hashed_password" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "hashedPassword";