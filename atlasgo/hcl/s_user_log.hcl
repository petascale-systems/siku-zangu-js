table "s_user_log" {
  schema = schema.public

  column "id_log" {
    type = binary(16)
    null = false
  }

  column "id_user" {
    type = binary(16)
    null = false
  }

  # symptom | mood | medication
  column "kind" {
    type = varchar(16)
    null = false
  }

  column "value" {
    type = varchar(64)
    null = false
  }

  # A clearing event: the user removed everything of this kind at this moment.
  #
  # Recorded as a row of its own rather than inferred from a gap, because "I
  # have no symptoms today" and "I did not open the app today" are different
  # facts and the history has to tell them apart. This column is the truth;
  # `value` is empty on such a row only because it cannot be null.
  column "cleared" {
    type    = bool
    null    = false
    default = false
  }

  # When the entry happened, supplied by the client and clamped server-side.
  #
  # datetime, not timestamp: mysql2's `timezone: '+00:00'` is a client-side
  # parsing hint and never issues SET time_zone, so MySQL would convert a
  # TIMESTAMP using whatever the session timezone happens to be. DATETIME is
  # stored literally. It also survives 2038 and can hold a backdated entry.
  column "logged_at" {
    type = datetime(3)
    null = false
  }

  # When the row was actually written. Distinct from logged_at, which the client
  # supplies; for backfilled rows the two differ by design.
  column "created_at" {
    type    = timestamp
    null    = false
    default = sql("current_timestamp")
  }

  primary_key {
    columns = [column.id_log]
  }

  foreign_key "fk_user_user_log" {
    columns     = [column.id_user]
    ref_columns = [table.s_user.column.id_user]
    on_delete   = CASCADE
    on_update   = NO_ACTION
  }

  # One index doing three jobs, keeping the repo's one-index-per-table shape:
  # id_user is leftmost so InnoDB accepts it as the foreign key's supporting
  # index; it serves the per-user recent lookup; and being unique it makes the
  # append idempotent. That last part is what lets a v1.1.0 client re-PATCH its
  # whole history on every save without duplicating anything.
  index "fk_user_user_log" {
    unique  = true
    columns = [column.id_user, column.kind, column.value, column.logged_at]
  }
}
