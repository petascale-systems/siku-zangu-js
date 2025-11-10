table "s_article_kv" {
  schema = schema.public

  column "id_article" {
    type = binary(16)
    null = false
  }

  column "k" {
    type = varchar(32)
    null = false
  }

  column "v" {
    type = text
    null = false
  }

  primary_key {
    columns = [column.id_article, column.k]
  }

  foreign_key "fk_article_article_kv" {
    columns = [column.id_article]
    ref_columns = [table.s_article.column.id_article]
    on_delete = CASCADE
    on_update = NO_ACTION
  }

  index "fk_article_article_kv" {
    columns = [column.id_article]
  }
}
