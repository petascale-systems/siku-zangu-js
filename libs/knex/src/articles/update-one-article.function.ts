import {APIError, Article, ARTICLE_SCHEMA} from "@siku-zangu/core";
import {articleToKv} from "./article-to-kv.function";
import {DATABASE} from "../create-database.function";
import {ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT, buildArticleTableJoins} from "./build-article-table-joins.function";
import {rowToArticle} from "./row-to-article.function";

export async function updateOneArticle(articleId: string, article: Article) {
    const parsedArticle = ARTICLE_SCHEMA.safeParse(article);
    if (!parsedArticle.success) {
        const issues = parsedArticle.error.issues.map(i => ({
            path: i.path,
            error: i.message,
        }));

        return Promise.reject({status: 400, message: 'Article validation failed', issues} as APIError);
    }

    const kvList = articleToKv(parsedArticle.data);
    if (kvList.length <= 0) {
        return Promise.reject({
            status: 400,
            message: 'Article validation failed',
            issues: [{path: ['kv'], error: 'No valid key-value pairs'}]
        } as APIError);
    }

    const articleIdBin = Buffer.from(articleId.replace(/-/g, ''), 'hex');
    await DATABASE
        .insert(kvList.map(kv => ({...kv, id_article: articleIdBin})))
        .into('s_article_kv')
        .onConflict()
        .merge();
    return buildArticleTableJoins(DATABASE)
        .where('_a.id_article', articleIdBin)
        .first(ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT)
        .then(row => rowToArticle(row));
}