import {Article} from "@siku-zangu/core";

export function rowToArticle(row: any) {
    return {
        article_id: row.article_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        kv: {
            author: row.author,
            title: row.title,
            slug: row.slug,
            category: row.category,
            content: row.content,
            status: row.status,
            language: row.language,
            has_cover_image: row.has_cover_image == true,
        },
    } as Article;
}