"use client"

import {Article, ArticlesFetchParams, Page} from "@siku-zangu/core";
import {useEffect, useState} from "react";
import {getJSON} from "../get-json.function";

export const ARTICLES_API_PATH = "/api/articles";

async function _fetchArticles(params: ArticlesFetchParams) {
    return getJSON<Page<Article>>(ARTICLES_API_PATH, params ?? {});
}

export function useArticlesPage(params: ArticlesFetchParams) {
    const [articlesPage, setArticlesPage] = useState<Page<Article>>();
    const [isFetchingArticlesPage, setIsFetchingArticlesPage] = useState<boolean>(true);

    useEffect(() => {
        setIsFetchingArticlesPage(true);
        _fetchArticles(params)
            .then((page) => {
                if (!page) return;
                const filtered = params.language
                    ? (page.items ?? []).filter(
                        (a) => !a.kv?.language || a.kv.language === params.language
                    )
                    : page.items ?? [];

                setArticlesPage({ ...page, items: filtered });
            })
            .finally(() => setIsFetchingArticlesPage(false));
    }, [params.q, params.page, params.size, params.status, params.language]);

    return {articlesPage, isFetchingArticlesPage};
}