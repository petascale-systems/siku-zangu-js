import {DATABASE} from "../create-database.function";

export async function selectOneArticleCoverImage(articleId: string) {
    return DATABASE
        .from('s_article_cover_image')
        .first({cover_image: 'cover_image'})
        .where({id_article: Buffer.from(articleId.replace(/-/g, ''), 'hex')})
        .then(coverImage => {
            if (coverImage) return coverImage.cover_image as ArrayBuffer;
            return Promise.reject({
                status: 404,
                message: 'Article cover image could not be found.'
            });
        })
}