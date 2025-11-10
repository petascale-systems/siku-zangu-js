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
            .then(setArticlesPage)
            .finally(() => setIsFetchingArticlesPage(false));
    }, [params.q, params.page, params.size, params.status]);

    return {articlesPage, isFetchingArticlesPage};
}