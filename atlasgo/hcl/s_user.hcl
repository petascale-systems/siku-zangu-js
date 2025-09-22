table "s_user" {
  schema = schema.public

  column "id_user" {
    type = binary(16)
    null = false
  }

  column "created_at" {
    type    = timestamp
    null    = false
    default = sql("current_timestamp")
  }

  column "updated_at" {
    type      = timestamp
    null      = false
    default   = sql("current_timestamp")
    on_update = sql("current_timestamp")
  }

  primary_key {
    columns = [column.id_user]
  }
}
