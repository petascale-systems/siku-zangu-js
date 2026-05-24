import {DATABASE} from "@siku-zangu/knex";
import {Knex} from "knex";

export function buildArticleTableJoins(db: Knex | Knex.Transaction, options = {includeContent: true}) {
    let sql = db
        .from('s_article as _a')
        .leftJoin('s_article_kv as _author', DATABASE.raw('_author.id_article=_a.id_article and _author.k="author"'))
        .leftJoin('s_article_kv as _status', DATABASE.raw('_status.id_article=_a.id_article and _status.k="status"'))
        .leftJoin('s_article_kv as _title', DATABASE.raw('_title.id_article=_a.id_article and _title.k="title"'))
        .leftJoin('s_article_kv as _slug', DATABASE.raw('_slug.id_article=_a.id_article and _slug.k="slug"'))
        .leftJoin('s_article_kv as _category', DATABASE.raw('_category.id_article=_a.id_article and _category.k="category"'))
        .leftJoin('s_article_kv as _language', DATABASE.raw('_language.id_article=_a.id_article and _language.k="language"'))
        .leftJoin('s_article_kv as _references', DATABASE.raw('_references.id_article=_a.id_article and _references.k="references"'))
        .leftJoin('s_article_cover_image as _cover_image', '_cover_image.id_article', '_a.id_article');

    if (!options.includeContent) return sql;
    return sql.leftJoin('s_article_kv as _content', DATABASE.raw('_content.id_article=_a.id_article and _content.k="content"'));
}

export const ARTICLE_TABLE_COLUMN_ALIASES = {
    article_id: DATABASE.raw('lower(hex(_a.id_article))'),
    created_at: '_a.created_at',
    updated_at: '_a.updated_at',
    author: '_author.v',
    status: '_status.v',
    title: '_title.v',
    slug: '_slug.v',
    category: '_category.v',
    language: '_language.v',
    has_cover_image: DATABASE.raw('_cover_image.id_article is not null'),
    references: '_references.v',
}

export const ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT = {
    ...ARTICLE_TABLE_COLUMN_ALIASES,
    content: '_content.v'
}