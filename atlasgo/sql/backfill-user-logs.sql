-- Migrates log history out of the `s_user_kv` JSON blob into `s_user_log`.
--
-- Run by `sikuzangu-org-docker-entrypoint.sh` after `atlas schema apply`.
--
-- Lives beside the declarative schema in `atlasgo/`: `hcl/` is the shape,
-- `sql/` is the data that has to move once the shape changes. Atlas only reads
-- `file://atlasgo/hcl`, so this directory is invisible to it.
--
-- Set-based on purpose: `JSON_TABLE` expands each stored array into rows inside
-- the database, so there is no row-by-row round trip and nothing to bundle into
-- the image.
--
-- Idempotent twice over, so running it on every deploy is safe:
--   * `ON DUPLICATE KEY UPDATE id_log = id_log` collides with the unique
--     (id_user, kind, value, logged_at) index and leaves the existing row
--     alone. Used rather than INSERT IGNORE, which would also swallow foreign
--     key violations and bad datetimes.
--   * the `logs_backfilled_at` marker excludes accounts already done.
--
-- What it cannot rescue: the old `varchar(4096)` ceiling truncated some values
-- mid-JSON. `JSON_VALID` skips those — they are unrecoverable, not retryable.
-- The counts printed after the inserts are there to show how many.

-- Entries first; the marker below depends on them having landed.
INSERT INTO s_user_log (id_log, id_user, kind, value, cleared, logged_at)
SELECT
    -- Not UUID_TO_BIN: MySQL-only, and production runs MariaDB. Same bytes.
    UNHEX(REPLACE(UUID(), '-', '')),
    parsed.id_user,
    parsed.kind,
    parsed.value,
    0,
    parsed.logged_at
FROM (
    SELECT
        entries.id_user,
        entries.kind,
        entries.value,
        -- Stored as ISO-8601 with a Z, with or without milliseconds.
        -- STR_TO_DATE yields NULL on anything it cannot read, rather than
        -- raising, which is what lets the filter below drop bad rows.
        COALESCE(
            STR_TO_DATE(
                REPLACE(REPLACE(entries.ts, 'T', ' '), 'Z', ''),
                '%Y-%m-%d %H:%i:%s.%f'
            ),
            STR_TO_DATE(
                REPLACE(REPLACE(entries.ts, 'T', ' '), 'Z', ''),
                '%Y-%m-%d %H:%i:%s'
            )
        ) AS logged_at
    -- Each kind is filtered to valid JSON BEFORE its expansion. JSON_TABLE is
    -- a lateral join evaluated per row, so a value the old 4096-byte ceiling
    -- truncated would raise there and abort the whole migration if it were
    -- filtered only in an outer WHERE.
    FROM (
        SELECT kv.id_user, 'symptom' AS kind, j.value AS value, j.ts AS ts
        FROM (
                 SELECT id_user, v FROM s_user_kv
                 WHERE k = 'symptom_logs' AND JSON_VALID(v)
             ) AS kv,
             JSON_TABLE(kv.v, '$[*]' COLUMNS (
                 value VARCHAR(64) PATH '$.symptom',
                 ts    VARCHAR(64) PATH '$.timestamp'
             )) AS j

        UNION ALL

        SELECT kv.id_user, 'mood', j.value, j.ts
        FROM (
                 SELECT id_user, v FROM s_user_kv
                 WHERE k = 'mood_logs' AND JSON_VALID(v)
             ) AS kv,
             JSON_TABLE(kv.v, '$[*]' COLUMNS (
                 value VARCHAR(64) PATH '$.mood',
                 ts    VARCHAR(64) PATH '$.timestamp'
             )) AS j

        UNION ALL

        SELECT kv.id_user, 'medication', j.value, j.ts
        FROM (
                 SELECT id_user, v FROM s_user_kv
                 WHERE k = 'medication_logs' AND JSON_VALID(v)
             ) AS kv,
             JSON_TABLE(kv.v, '$[*]' COLUMNS (
                 value VARCHAR(64) PATH '$.medication',
                 ts    VARCHAR(64) PATH '$.timestamp'
             )) AS j
    ) AS entries
    WHERE entries.value IS NOT NULL
      AND entries.value <> ''
      AND entries.ts IS NOT NULL
) AS parsed
WHERE parsed.logged_at IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM s_user_kv AS marker
      WHERE marker.id_user = parsed.id_user
        AND marker.k = 'logs_backfilled_at'
  )
ON DUPLICATE KEY UPDATE id_log = s_user_log.id_log;

-- Mark every account, including those with nothing to migrate, so later runs
-- skip them outright instead of re-scanning. `UPDATE v = v` keeps the first
-- timestamp, which records when the account was actually migrated.
INSERT INTO s_user_kv (id_user, k, v)
SELECT u.id_user, 'logs_backfilled_at', DATE_FORMAT(UTC_TIMESTAMP(3), '%Y-%m-%dT%T.%fZ')
FROM s_user AS u
ON DUPLICATE KEY UPDATE v = s_user_kv.v;

-- Reported in the deploy log so the migration is observable, and so a truncated
-- value is visible as a number rather than passed over in silence.
SELECT
    (SELECT COUNT(*) FROM s_user_log)                                       AS log_rows_total,
    (SELECT COUNT(*) FROM s_user_kv WHERE k = 'logs_backfilled_at')          AS users_marked,
    (SELECT COUNT(*) FROM s_user_kv
      WHERE k IN ('symptom_logs', 'mood_logs', 'medication_logs')
        AND NOT JSON_VALID(v))                                              AS unrecoverable_kv_values;
