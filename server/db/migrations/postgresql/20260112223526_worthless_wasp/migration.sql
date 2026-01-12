CREATE TYPE "quantity_type" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TABLE "fagrc_game" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_game_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"icon_link" varchar NOT NULL,
	"description" varchar NOT NULL,
	"link" varchar NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_mod" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_mod_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"icon_link" varchar,
	"description" varchar,
	"link" varchar NOT NULL,
	"game_id" integer NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_processable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_processable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"icon_link" varchar NOT NULL,
	"description" varchar NOT NULL,
	"energy_value" real DEFAULT 0 NOT NULL,
	"game_id" integer NOT NULL,
	"mod_id" integer,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_quantity" (
	"recipe_id" integer,
	"processable_id" integer,
	"quantity" integer NOT NULL,
	"measurement" varchar NOT NULL,
	"type" "quantity_type",
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fagrc_quantity_pkey" PRIMARY KEY("recipe_id","processable_id")
);
--> statement-breakpoint
CREATE TABLE "fagrc_recipe" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_recipe_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"duration" numeric,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "game_idx" ON "fagrc_processable" ("game_id");--> statement-breakpoint
CREATE INDEX "mod_idx" ON "fagrc_processable" ("mod_id");--> statement-breakpoint
ALTER TABLE "fagrc_mod" ADD CONSTRAINT "fagrc_mod_game_id_fagrc_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "fagrc_game"("id");--> statement-breakpoint
ALTER TABLE "fagrc_processable" ADD CONSTRAINT "fagrc_processable_game_id_fagrc_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "fagrc_game"("id");--> statement-breakpoint
ALTER TABLE "fagrc_processable" ADD CONSTRAINT "fagrc_processable_mod_id_fagrc_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "fagrc_mod"("id");--> statement-breakpoint
ALTER TABLE "fagrc_quantity" ADD CONSTRAINT "fagrc_quantity_recipe_id_fagrc_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "fagrc_recipe"("id");--> statement-breakpoint
ALTER TABLE "fagrc_quantity" ADD CONSTRAINT "fagrc_quantity_processable_id_fagrc_recipe_id_fkey" FOREIGN KEY ("processable_id") REFERENCES "fagrc_recipe"("id");