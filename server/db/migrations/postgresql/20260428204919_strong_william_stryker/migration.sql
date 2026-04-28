CREATE TYPE "fagrc_junction_processable_recipe_type" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TABLE "fagrc_game" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_game_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"description" varchar NOT NULL,
	"link" varchar NOT NULL,
	"wiki_link" varchar,
	"icon_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_icon" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_icon_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"svg" varchar NOT NULL UNIQUE,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_junction_processable_recipe" (
	"recipe_id" integer,
	"processable_id" integer,
	"quantity" integer NOT NULL,
	"measurement" varchar NOT NULL,
	"type" "fagrc_junction_processable_recipe_type",
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fagrc_junction_processable_recipe_pkey" PRIMARY KEY("recipe_id","processable_id")
);
--> statement-breakpoint
CREATE TABLE "fagrc_junction_processor_recipe" (
	"recipe_id" integer,
	"processor_id" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fagrc_junction_processor_recipe_pkey" PRIMARY KEY("recipe_id","processor_id")
);
--> statement-breakpoint
CREATE TABLE "fagrc_mod" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_mod_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"description" varchar,
	"link" varchar NOT NULL,
	"game_id" integer NOT NULL,
	"icon_id" integer NOT NULL,
	"base_game" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_basegame" UNIQUE("game_id","base_game")
);
--> statement-breakpoint
CREATE TABLE "fagrc_processable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_processable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL UNIQUE,
	"description" varchar NOT NULL,
	"energy_value" real DEFAULT 0 NOT NULL,
	"mod_id" integer,
	"icon_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_processor" (
	"processable_id" integer PRIMARY KEY,
	"energy_consumption" real NOT NULL,
	"crafting_speed" real NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fagrc_recipe" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fagrc_recipe_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"duration" real,
	"icon_id" integer,
	"mod_id" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"hashed_password" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "game_idx" ON "fagrc_mod" ("game_id");--> statement-breakpoint
CREATE INDEX "fagrc_processable_mod_id_index" ON "fagrc_processable" ("mod_id");--> statement-breakpoint
CREATE INDEX "fagrc_recipe_mod_id_index" ON "fagrc_recipe" ("mod_id");--> statement-breakpoint
ALTER TABLE "fagrc_game" ADD CONSTRAINT "fagrc_game_icon_id_fagrc_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "fagrc_icon"("id");--> statement-breakpoint
ALTER TABLE "fagrc_junction_processable_recipe" ADD CONSTRAINT "fagrc_junction_processable_recipe_zqKrvwQbEG4n_fkey" FOREIGN KEY ("recipe_id") REFERENCES "fagrc_recipe"("id");--> statement-breakpoint
ALTER TABLE "fagrc_junction_processable_recipe" ADD CONSTRAINT "fagrc_junction_processable_recipe_cwOwZto6Fxnv_fkey" FOREIGN KEY ("processable_id") REFERENCES "fagrc_processable"("id");--> statement-breakpoint
ALTER TABLE "fagrc_junction_processor_recipe" ADD CONSTRAINT "fagrc_junction_processor_recipe_recipe_id_fagrc_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "fagrc_recipe"("id");--> statement-breakpoint
ALTER TABLE "fagrc_junction_processor_recipe" ADD CONSTRAINT "fagrc_junction_processor_recipe_AVVCp8algE4m_fkey" FOREIGN KEY ("processor_id") REFERENCES "fagrc_processor"("processable_id");--> statement-breakpoint
ALTER TABLE "fagrc_mod" ADD CONSTRAINT "fagrc_mod_game_id_fagrc_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "fagrc_game"("id");--> statement-breakpoint
ALTER TABLE "fagrc_mod" ADD CONSTRAINT "fagrc_mod_icon_id_fagrc_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "fagrc_icon"("id");--> statement-breakpoint
ALTER TABLE "fagrc_processable" ADD CONSTRAINT "fagrc_processable_mod_id_fagrc_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "fagrc_mod"("id");--> statement-breakpoint
ALTER TABLE "fagrc_processable" ADD CONSTRAINT "fagrc_processable_icon_id_fagrc_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "fagrc_icon"("id");--> statement-breakpoint
ALTER TABLE "fagrc_processor" ADD CONSTRAINT "fagrc_processor_processable_id_fagrc_processable_id_fkey" FOREIGN KEY ("processable_id") REFERENCES "fagrc_processable"("id");--> statement-breakpoint
ALTER TABLE "fagrc_recipe" ADD CONSTRAINT "fagrc_recipe_icon_id_fagrc_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "fagrc_icon"("id");--> statement-breakpoint
ALTER TABLE "fagrc_recipe" ADD CONSTRAINT "fagrc_recipe_mod_id_fagrc_mod_id_fkey" FOREIGN KEY ("mod_id") REFERENCES "fagrc_mod"("id");