-- Migration: gateway_logs_promoted_columns_trigger
--
-- SAFETY HEADER (house rules -- see packages/db/MIGRATIONS.md#zero-downtime-rules).
set lock_timeout = '2s';
set statement_timeout = '30s';

-- WHAT: KRTX-4023, the mixed-version writer guard for the promoted columns
-- `served_model` / `usage_estimated` (added by
-- 20261108090000000_gateway_logs_served_model_usage_estimated.sql, history
-- healed by the batched backfill 20261108090000100).
--
-- WHY: migrations run before the new pods start, but an ECS rollout replaces
-- pods gradually — old code keeps inserting rows until its last task drains.
-- Old writers know nothing of the new columns, so every row they insert in
-- that window carries the metadata keys and NULL columns, and the table is
-- insert-only: the one-shot backfill never sees those rows again. A NULL
-- column reads as a missing metadata key (the pre-promotion read), so those
-- rows group under the requested model instead of the served one, and
-- estimated-usage rows lose their estimated flag. This BEFORE INSERT trigger
-- fills both columns from the metadata keys for EVERY writer, old or new.
-- The new writer (apps/api/src/shared/gateway-trace-row.ts) lifts the same
-- keys into the same columns, so for it the trigger is a no-op (it fills only
-- NULL columns and reads the same values the writer wrote).
--
-- SEMANTICS, exactly the backfill's and the pre-promotion read's: a missing
-- or jsonb-null key leaves the column NULL (the readers treat a NULL column
-- exactly as the missing key they replaced), and the flag is
-- `(metadata->>'usageEstimated') = 'true'` — no cast, so no throw on a
-- non-boolean value. The metadata in the table is NUL-free (every writer
-- version scrubs it via stripNullBytesDeep before insert), so the lifted
-- values cannot carry U+0000.
--
-- LIFECYCLE: scaffolding for the rollout window only. Drop both objects in a
-- follow-up migration once the release carrying this change has replaced
-- every old writer (any deploy after the rollout completes is safe).
--
-- LOCKS. CREATE OR REPLACE FUNCTION locks its pg_proc row only. CREATE
-- TRIGGER takes SHARE ROW EXCLUSIVE on the table — inserts queue behind it
-- for the brief catalog change; the 2s lock budget aborts instead of
-- queueing prod writes. No table rewrite, no data pass.
--
-- MIXED VERSIONS: this trigger exists to make the mixed-version window
-- correct; old code never reads the columns.
--
-- ROLL BACK: drop the trigger and the function; the new writer sets the
-- columns itself.

CREATE OR REPLACE FUNCTION kortix.gateway_request_logs_fill_promoted_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = kortix
AS $$
DECLARE
  raw text;
BEGIN
  -- The same 255-byte bound the new writer applies to the promoted model
  -- strings (the v4 covering index carries served_model as a btree tuple
  -- member; old writers predate boundMetadata, so their metadata key is
  -- unbounded). Code-point cut first (scaled from the byte/char ratio, so
  -- the estimate is within one code point of the budget), then drop whole
  -- code points until within the budget — never a mid-character cut.
  IF NEW.served_model IS NULL AND NEW.metadata ? 'servedModel' THEN
    raw := NEW.metadata ->> 'servedModel';
    IF raw IS NOT NULL THEN
      IF octet_length(raw) > 255 THEN
        raw := left(raw, greatest(63, (255 * char_length(raw) / octet_length(raw))::int));
        WHILE octet_length(raw) > 255 LOOP
          raw := left(raw, char_length(raw) - 1);
        END LOOP;
      END IF;
      NEW.served_model := raw;
    END IF;
  END IF;
  IF NEW.usage_estimated IS NULL AND NEW.metadata ->> 'usageEstimated' IS NOT NULL THEN
    NEW.usage_estimated := (NEW.metadata ->> 'usageEstimated') = 'true';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS fill_promoted_columns ON "kortix"."gateway_request_logs";--> statement-breakpoint
CREATE TRIGGER fill_promoted_columns
  BEFORE INSERT ON "kortix"."gateway_request_logs"
  FOR EACH ROW EXECUTE FUNCTION kortix.gateway_request_logs_fill_promoted_columns();
