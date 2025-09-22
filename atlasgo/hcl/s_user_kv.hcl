table "s_user_kv" {
  schema = schema.public

  column "id_user" {
    type = binary(16)
    null = false
  }

  column "k" {
    type = varchar(32)
    null = false
  }

  column "v" {
    type = varchar(4096)
    null = false
  }

  primary_key {
    columns = [column.id_user, column.k]
  }

  foreign_key "fk_user_user_kv" {
    columns = [column.id_user]
    ref_columns = [table.s_user.column.id_user]
    on_delete = CASCADE
    on_update = NO_ACTION
  }

  index "fk_user_user_kv" {
    columns = [column.id_user]
  }
}
