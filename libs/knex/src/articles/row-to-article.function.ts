import {Article} from "@siku-zangu/core";

function parseReferences(raw: unknown): string[] | undefined {
    if (typeof raw !== 'string' || raw.length === 0) return undefined;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((r): r is string => typeof r === 'string');
    } catch {
        // legacy: newline-separated string
        return raw.split('\n').map(s => s.trim()).filter(Boolean);
    }
    return undefined;
}

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
            references: parseReferences(row.references),
        },
    } as Article;
}