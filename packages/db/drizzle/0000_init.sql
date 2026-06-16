CREATE TYPE "public"."evse_status" AS ENUM('AVAILABLE', 'CHARGING', 'BLOCKED', 'OUTOFORDER', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('QUOTED', 'AUTHORIZING', 'STARTING', 'ACTIVE', 'STOPPING', 'SETTLING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "cpos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cpos_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpo_id" uuid NOT NULL,
	"ocpi_location_id" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"country" varchar(2) DEFAULT 'IT' NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stations_ocpi_location_id_unique" UNIQUE("ocpi_location_id")
);
--> statement-breakpoint
CREATE TABLE "evses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"ocpi_evse_uid" varchar(64) NOT NULL,
	"status" "evse_status" DEFAULT 'UNKNOWN' NOT NULL,
	"max_power_kw" integer NOT NULL,
	"tariff_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evses_ocpi_evse_uid_unique" UNIQUE("ocpi_evse_uid")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evse_id" uuid NOT NULL,
	"status" "session_status" DEFAULT 'QUOTED' NOT NULL,
	"ocpi_session_id" varchar(64),
	"quoted_all_in_per_kwh" double precision,
	"quoted_total" double precision,
	"currency" varchar(3) DEFAULT 'EUR',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_cpo_id_cpos_id_fk" FOREIGN KEY ("cpo_id") REFERENCES "public"."cpos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evses" ADD CONSTRAINT "evses_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_evse_id_evses_id_fk" FOREIGN KEY ("evse_id") REFERENCES "public"."evses"("id") ON DELETE no action ON UPDATE no action;
