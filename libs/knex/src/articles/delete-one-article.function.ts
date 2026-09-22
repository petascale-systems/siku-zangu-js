import {DATABASE} from "../create-database.function";

export async function deleteOneArticle(articleIdHex: string) {
    const articleIdBin = Buffer.from(articleIdHex.replace(/-/g, ''), 'hex');
    await DATABASE.transaction(async (trx) => {
        await trx.from('s_article_kv').delete().where('id_article', articleIdBin);
        await trx.from('s_article_cover_image').delete().where('id_article', articleIdBin);
        await trx.from('s_article').delete().where('id_article', articleIdBin);
    });
}
