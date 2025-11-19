"use client"

import {ARTICLES_API_PATH} from './use-articles-page.function'
import {useEffect, useState} from "react";
import {APIError, Article} from "@siku-zangu/core";
import {getJSON} from "../get-json.function";
import {patchJSON} from "../patch-json.function";
import {postJSON} from "../post-json.function";

export const ARTICLE_BY_ID_API_PATH = (id?: string) => `${ARTICLES_API_PATH}/${id}`;
export const ARTICLE_COVER_IMAGE_API_PATH = (id?: string) => `${ARTICLES_API_PATH}/${id}/cover-image`;

async function _createArticle(article: Article) {
    return postJSON<Article, Article>(ARTICLES_API_PATH, article);
}

async function _fetchArticle(articleId: string) {
    return getJSON<Article>(ARTICLE_BY_ID_API_PATH(articleId))
}

async function _updateArticle(articleId: string, article: Article) {
    return patchJSON<Article, Article>(ARTICLE_BY_ID_API_PATH(articleId), article);
}

async function _updateArticleCoverImage(articleId: string, img: File) {
    const data = new FormData();
    data.append("cover_image", img);

    const path = ARTICLE_COVER_IMAGE_API_PATH(articleId);
    return fetch(path, {method: "PUT", body: data,})
        .then(async (res) => {
            if (res.ok) return;

            const err = await res.json()
            return Promise.reject((err ?? {message: 'Failed'}) as APIError);
        })
        .catch(e => Promise.reject((e ?? {message: `Could not POST ${path}`}) as APIError));
}

export function useArticle(articleId?: string) {
    const [article, setArticle] = useState<Article>();
    const [isFetchingArticle, setIsFetchingArticle] = useState<boolean>();
    const [isCreatingArticle, setIsCreatingArticle] = useState<boolean>();
    const [isUpdatingArticle, setIsUpdatingArticle] = useState<boolean>();

    async function createArticle(newArticle: Article, coverImage?: File) {
        setIsCreatingArticle(true);
        return _createArticle(newArticle)
            .then(async (a) => {
                if (coverImage && a.article_id) await _updateArticleCoverImage(a.article_id, coverImage);
                setArticle(a);
                return a
            })
            .finally(() => setIsCreatingArticle(false));
    }

    async function updateArticle(newArticle: Article, coverImage?: File) {
        if (!articleId || articleId === 'new') {
            return Promise.reject('ID is not set. Use createArticle instead.');
        }

        setIsUpdatingArticle(true);
        return _updateArticle(articleId, newArticle)
            .then(async (a) => {
                if (coverImage && articleId) await _updateArticleCoverImage(articleId, coverImage);
                if (a) setArticle(a);
                return a
            })
            .finally(() => setIsUpdatingArticle(false));
    }

    useEffect(() => {
        if (!articleId || articleId === 'new') return;

        setIsFetchingArticle(true);
        _fetchArticle(articleId)
            .then(setArticle)
            .finally(() => setIsFetchingArticle(false));
    }, [articleId])

    return {
        article,
        isFetchingArticle,
        isCreatingArticle,
        isUpdatingArticle,
        createArticle,
        updateArticle,
    };
}