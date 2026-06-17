ALTER TABLE "sessions" ADD COLUMN "final_kwh" double precision;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "final_total" double precision;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "failure_reason" text;
