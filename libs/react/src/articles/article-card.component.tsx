"use client"

import {Article, ArticleStatus} from "@siku-zangu/core";
import Link from "next/link";
import {useEffect, useState} from "react";
import {ARTICLE_COVER_IMAGE_API_PATH} from "./use-article.function";

export function ArticleStatusBadge({status = 'draft'}: { status?: ArticleStatus }) {
    const [_className, _setClassName] = useState(() => {
        if (status === "scheduled") return 'text-secondary-400 bg-secondary-100';
        if (status === "published") return 'text-primary-400 bg-primary-100';
        return 'text-gray-400 bg-gray-200';
    });
    const [_label, _setLabel] = useState(() => {
        if (status === "scheduled") return 'Scheduled';
        if (status === "published") return 'Published';
        return 'Draft';
    });

    useEffect(() => {
        _setClassName((() => {
            if (status === "scheduled") return 'text-secondary-400 bg-secondary-100';
            if (status === "published") return 'text-primary-400 bg-primary-100';
            return 'text-primary-400 bg-primary-100';
        })())
        _setLabel((() => {
            if (status === "scheduled") return 'Scheduled';
            if (status === "published") return 'Published';
            return 'Draft';
        })());
    }, [status]);
    return <span className={`rounded-full text-sm px-4 py-1.5 ${_className}`}>{_label}</span>;
}

export function ArticleCard({article}: { article: Article }) {
    const [_imgSrc, _setImgSrc] = useState('https://placehold.co/600x400?text=Error+404');

    useEffect(() => {
        if (article.article_id && article?.kv?.has_cover_image) {
            _setImgSrc(ARTICLE_COVER_IMAGE_API_PATH(article.article_id))
        }
    }, [article]);
    return (
        <Link href={`/dashboard/articles/${article.article_id}`}
              className='w-full min-w-64 min-h-56 flex flex-col items-start justify-between border border-gray-200 rounded-lg p-6 gap-2 hover:shadow-lg'>
            <ArticleStatusBadge status={article.kv?.status}/>
            <span className='text-base font-medium'>{article?.kv?.title ?? 'Undefined title'}</span>
            <div className='flex gap-2'>
                <img src={_imgSrc}
                     alt={'Cover image'}
                     className='h-16 w-32 object-cover bg-cover rounded-lg'/>
                <div className='flex flex-col grow justify-between text-gray-500 text-sm'>
                    <span>Author</span>
                    <span className='text-black font-medium'>{article?.kv?.author}</span>
                    <span className='text-xs'
                          suppressHydrationWarning>{new Date(article.created_at || '').toLocaleString()}</span>
                </div>
            </div>
        </Link>
    )
}