import {ARTICLES_API_PATH} from './use-articles-page.function'
import {useEffect, useState} from "react";
import {Article} from "@siku-zangu/core";
import {getJSON} from "../get-json.function";
import {patchJSON} from "../patch-json.function";
import {postJSON} from "../post-json.function";

export const ARTICLE_BY_ID_API_PATH = (id: string) => `${ARTICLES_API_PATH}/${id}`;
export const ARTICLE_COVER_IMAGE_API_PATH = (id: string) => `${ARTICLES_API_PATH}/${id}/cover-image`;

async function _createArticle(article: Article) {
    return postJSON<Article, Article>(ARTICLES_API_PATH, article);
}

async function _fetchArticleById(articleId: string) {
    return getJSON<Article>(ARTICLE_BY_ID_API_PATH(articleId))
}

async function _updateArticleById(articleId: string, article: Article) {
    return patchJSON<Article, Article>(ARTICLE_BY_ID_API_PATH(articleId), article);
}

async function _updateArticleCoverImage(articleId: string, coverImage: File) {

}

export function useArticle(articleId?: string) {
    const [article, setArticle] = useState<Article>();
    const [isFetchingArticle, setIsFetchingArticle] = useState<boolean>();
    const [isCreatingArticle, setIsCreatingArticle] = useState<boolean>();
    const [isUpdatingArticle, setIsUpdatingArticle] = useState<boolean>();

    async function createArticle(newArticle: Article) {
        setIsCreatingArticle(true);
        return _createArticle(newArticle)
            .then(a => {
                if (a) setArticle(a);
                return a
            })
            .finally(() => setIsCreatingArticle(false));
    }

    async function updateArticle(newArticle: Article) {
        if (!articleId || articleId === 'new') {
            return Promise.reject('ID is not set. Use createArticle instead.');
        }

        setIsUpdatingArticle(true);
        return _updateArticleById(articleId, newArticle)
            .then(a => {
                if (a) setArticle(a);
                return a
            })
            .finally(() => setIsUpdatingArticle(false));
    }

    useEffect(() => {
        if (!articleId || articleId === 'new') return;

        setIsFetchingArticle(true);
        _fetchArticleById(articleId)
            .then(setArticle)
            .finally(() => setIsFetchingArticle(false));
    }, [articleId])

    return {article, isFetchingArticle, isCreatingArticle, isUpdatingArticle, createArticle, updateArticle};
}