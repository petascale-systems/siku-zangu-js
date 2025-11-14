import {DATABASE} from "../create-database.function";

export async function updateOneArticleCoverImage(articleId: string, file: File) {
    await DATABASE
        .insert({
            id_article: Buffer.from(articleId.replace('-', ''), 'hex'),
            cover_image: Buffer.from(await file.arrayBuffer())
        })
        .into('s_article_cover_image')
        .onConflict()
        .merge(['cover_image']);
}