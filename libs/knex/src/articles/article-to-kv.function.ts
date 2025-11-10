import {Article, Kv} from "@siku-zangu/core";

export function articleToKv(article: Article) {
    const kvs: Kv[] = []
    if (article?.kv?.author) kvs.push({k: 'author', v: article?.kv?.author});
    if (article?.kv?.title) kvs.push({k: 'title', v: article?.kv?.title});
    if (article?.kv?.slug) kvs.push({k: 'slug', v: article?.kv?.slug});
    if (article?.kv?.category) kvs.push({k: 'category', v: article?.kv?.category});
    if (article?.kv?.content) kvs.push({k: 'content', v: article?.kv?.content});
    if (['draft', 'published', 'scheduled'].includes(article?.kv?.status as string)) kvs.push({
        k: 'status',
        v: article?.kv?.status as string
    });
    if (['en', 'sw'].includes(article?.kv?.language as string)) kvs.push({
        k: 'language',
        v: article?.kv?.language as string
    });
    return kvs
}