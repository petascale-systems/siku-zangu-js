import {ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT, buildArticleTableJoins} from "./build-article-table-joins.function";
import {rowToArticle} from "./row-to-article.function";
import {DATABASE} from "../create-database.function";
import {APIError} from "@siku-zangu/core";

export async function selectOneArticle(articleId: string) {
    const articleIdBin = Buffer.from(articleId.replace(/-/g, ''), 'hex');
    return buildArticleTableJoins(DATABASE)
        .where('_a.id_article', articleIdBin)
        .first(ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT)
        .then(row => {
            if (!row) return Promise.reject({status: 404, message: 'Article not found'} as APIError);
            return rowToArticle(row);
        });
}