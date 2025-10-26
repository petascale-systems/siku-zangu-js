import {Language} from "./user.model";
import {z} from 'zod';

export type ArticleStatus = 'draft' | 'published' | 'scheduled'
export type Article = {
    article_id?: string;
    created_at?: string;
    updated_at?: string;
    kv?: {
        author?: string;
        status?: ArticleStatus;
        title?: string;
        slug?: string;
        category?: string;
        content?: string;
        language?: Language;
        has_cover_image?: boolean;
    }
}

export const ARTICLE_SCHEMA = z.object({
    kv: z.object({
        author: z.string().optional(),
        status: z.enum(['draft', 'published', 'scheduled'], {message: 'Article status is invalid'}).optional(),
        title: z.string().max(128, {message: 'Article title is too long'}).optional(),
        slug: z.string().max(64, {message: 'Article slug is too long'}).optional(),
        category: z.string().optional(),
        content: z.string().max(16384, {message: 'Article content is too long'}).optional(),
        language: z.enum(['sw', 'en'], {message: 'Article language is invalid'}).optional(),
    })
});