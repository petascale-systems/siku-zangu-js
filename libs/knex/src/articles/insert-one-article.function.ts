import {APIError, Article, ARTICLE_SCHEMA} from "@siku-zangu/core";
import {articleToKv} from "./article-to-kv.function";
import {DATABASE,} from "../create-database.function";
import {randomUUID} from "node:crypto";
import {ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT, buildArticleTableJoins} from "./build-article-table-joins.function";
import {rowToArticle} from "./row-to-article.function";

export async function insertOneArticle(article: Article) {
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

    const articleId = DATABASE.fn.uuidToBin(randomUUID());
    const tx = await DATABASE.transaction();
    try {
        await tx.insert({id_article: articleId}).into('s_article');
        await tx.insert(kvList.map(kv => ({...kv, id_article: articleId}))).into('s_article_kv');
        const article = await buildArticleTableJoins(tx)
            .where('_a.id_article', articleId)
            .first(ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT)
            .then(async (row) => rowToArticle(row));

        await tx.commit();
        return article;
    } catch (e) {
        await tx.rollback();
        return Promise.reject(e);
    }
}