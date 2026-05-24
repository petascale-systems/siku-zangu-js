import {ARTICLE_TABLE_COLUMN_ALIASES, buildArticleTableJoins} from "./build-article-table-joins.function";
import {Article, ArticlesFetchParams, Page} from "@siku-zangu/core";
import {rowToArticle} from "./row-to-article.function";
import {DATABASE} from "../create-database.function";

export async function selectArticlesPage(params: ArticlesFetchParams) {
    if (!params.page) params.page = 1;
    if (!params.size) params.size = 20;
    if (params.q && params.q.trim()) params.q = params.q.trim().toLowerCase();

    let baseSQL = buildArticleTableJoins(DATABASE, {includeContent: false})
    if (params.status) {
        baseSQL = baseSQL.where({'_status.v': params.status});
    }

    if (params.q) {
        baseSQL = baseSQL.whereRaw(`lower(_title.v) like "%${params.q}%"`)
    }

    const articles = await baseSQL.clone().select(ARTICLE_TABLE_COLUMN_ALIASES)
        .offset((params.page - 1) * params.size).limit(params.size)
        .orderBy("_a.created_at", "desc")
        .then(rows => rows.map(row => rowToArticle(row)));
    const countOfArticles = await baseSQL.clone().count<{ count: number }>({count: '*'})
        .first()
        .then(count => Number(count?.count || 0))

    return {
        size: Number(params.size),
        page: Number(params.page),
        totalItems: Number(countOfArticles),
        totalPages: Math.ceil(Number(countOfArticles) / Number(params.size)),
        items: articles
    } as Page<Article>;
}