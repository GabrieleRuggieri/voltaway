-- =============================================================================
-- Voltaway — settlement sessioni di ricarica (0001_sessions_settlement)
-- =============================================================================
--
-- Scopo:
--   Estendere la tabella sessions con i dati finali post-ricarica: energia
--   consumata, importo totale e motivo di fallimento (se la sessione non
--   completa con successo).
--
-- Componenti:
--   Colonne aggiunte a sessions: final_kwh, final_total, failure_reason
--
-- Flusso dev:
--   Migrazione incrementale dopo 0000_init; applicata in ordine con Drizzle.
--   Popolata dal worker/API al termine del ciclo di vita della sessione
--   (stati SETTLING → COMPLETED / FAILED).
--
ALTER TABLE "sessions" ADD COLUMN "final_kwh" double precision;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "final_total" double precision;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "failure_reason" text;
