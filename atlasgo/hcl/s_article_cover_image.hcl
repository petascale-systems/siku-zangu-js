table "s_article_cover_image" {
  schema = schema.public

  column "id_article" {
    type = binary(16)
    null = false
  }

  column "cover_image" {
    type = mediumblob
    null = false
  }

  primary_key {
    columns = [column.id_article]
  }

  foreign_key "fk_article_article_cover_image" {
    columns = [column.id_article]
    ref_columns = [table.s_article.column.id_article]
    on_delete = CASCADE
    on_update = NO_ACTION
  }

  index "fk_article_article_cover_image" {
    columns = [column.id_article]
  }
}
