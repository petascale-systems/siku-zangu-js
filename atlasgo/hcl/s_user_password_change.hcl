table "s_user_password_change" {
  schema = schema.public

  column "id_password_change" {
    type = binary(16)
    null = false
  }

  column "id_user" {
    type = binary(16)
    null = false
  }

  column "created_at" {
    type    = timestamp
    null    = false
    default = sql("current_timestamp")
  }

  primary_key {
    columns = [column.id_password_change]
  }

  foreign_key "fk_user_password_change_user" {
    columns = [column.id_user]
    ref_columns = [table.s_user.column.id_user]
    on_delete = CASCADE
    on_update = NO_ACTION
  }

  index "fk_user_password_change_user" {
    columns = [column.id_user]
  }
}
