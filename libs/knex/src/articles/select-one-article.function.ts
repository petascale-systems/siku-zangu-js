import {ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT, buildArticleTableJoins} from "./build-article-table-joins.function";
import {rowToArticle} from "./row-to-article.function";
import {DATABASE} from "../create-database.function";

export async function selectOneArticle(articleId: string) {
    const articleIdBin = Buffer.from(articleId.replace('-', ''), 'hex');
    return buildArticleTableJoins(DATABASE)
        .where('_a.id_article', articleIdBin)
        .first(ARTICLE_TABLE_COLUMN_ALIASES_WITH_CONTENT)
        .then(row => rowToArticle(row));
}