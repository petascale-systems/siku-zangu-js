table "s_admin" {
  schema = schema.public

  column "id_user" {
    type = binary(16)
    null = false
  }

  column "status" {
    type = varchar(8)
    null = false
  }

  primary_key {
    columns = [column.id_user]
  }

  foreign_key "fk_admin_user" {
    columns = [column.id_user]
    ref_columns = [table.s_user.column.id_user]
    on_delete = CASCADE
    on_update = NO_ACTION
  }

  index "fk_admin_user" {
    columns = [column.id_user]
  }
}
