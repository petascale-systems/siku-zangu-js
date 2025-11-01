'use client'

import {Button, Spinner, TextInput} from "flowbite-react";
import {PlusIcon} from '@heroicons/react/24/outline';
import {ArticleCard, Pagination, useArticlesPage} from "@siku-zangu/react";
import {Article, ArticlesFetchParams, ArticleStatus} from "@siku-zangu/core";
import {KeyboardEvent, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";

export default function ArticlesPage() {
    const _searchParams = useSearchParams();
    const _router = useRouter();
    const [_q, _setQ] = useState(_searchParams.get('q') as string || '');
    const [_fetchParams, _setFetchParams] = useState<ArticlesFetchParams>({
        page: parseInt(_searchParams.get('page') || '1'),
        size: parseInt(_searchParams.get('size') || '20'),
        status: _searchParams.get('status') as ArticleStatus,
        q: _searchParams.get('q') as string
    });
    const {articlesPage, isFetchingArticlesPage} = useArticlesPage(_fetchParams);

    const _handleStatusBtnClick = (status?: ArticleStatus) => {
        _updateFetchParams({q: _q, status: status});
    }

    const _handleQInputEnter = (q: KeyboardEvent<HTMLInputElement>) => {
        if (q.key !== 'Enter') return;
        _updateFetchParams({q: _q, status: _fetchParams.status});
    }

    const _updateFetchParams = (params: { [key: string]: string | number | undefined }) => {
        const queryParams = Object
            .entries(params)
            .filter(e => e[0] && e[1])
            .map(e => `${e[0]}=${e[1]}`)
            .join('&');
        _router.push(`/dashboard/articles?${queryParams}`);
    }

    const _handlePageChange = (page: number) => {
        if (page) _updateFetchParams({q: _q, status: _fetchParams.status, page: page});
    }

    useEffect(() => {
        _setFetchParams({
            page: parseInt(_searchParams.get('page') || '1'),
            size: parseInt(_searchParams.get('size') || '20'),
            status: _searchParams.get('status') as ArticleStatus,
            q: _searchParams.get('q') as string
        });
    }, [_searchParams]);

    return (
        <div className='px-5 pb-5'>
            <div className='w-full space-y-6 sticky top-0 z-5 bg-gray-50 py-5'>
                <div className='flex justify-between items-center'>
                    <span className='text-xl font-medium'>Article management</span>
                    <Button as='a' href='/dashboard/articles/new' size={'md'} color='secondary'
                            className='flex items-center gap-2'>
                        <PlusIcon className='size-4'/>
                        <span>Add article</span>
                    </Button>
                </div>

                <TextInput placeholder='Search Articles by Category or name'
                           type="text"
                           sizing="md"
                           color='gray'
                           applyTheme='merge'
                           theme={{field: {input: {withAddon: {off: 'rounded-full'}}}}}
                           value={_q}
                           onChange={(e) => _setQ(e.target.value)}
                           onKeyUp={_handleQInputEnter}/>

                <div className='flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center'>
                    <div className='flex items-center gap-2'>
                        <Button color={_fetchParams.status ? 'default' : 'primaryTonal'} size={'md'} pill
                                onClick={() => _handleStatusBtnClick()}>All</Button>
                        <Button color={_fetchParams.status !== 'draft' ? 'default' : 'primaryTonal'} size={'md'} pill
                                onClick={() => _handleStatusBtnClick('draft')}>Drafts</Button>
                        <Button color={_fetchParams.status !== 'scheduled' ? 'default' : 'primaryTonal'} size={'md'}
                                pill
                                onClick={() => _handleStatusBtnClick('scheduled')}>Scheduled</Button>
                        <Button color={_fetchParams.status !== 'published' ? 'default' : 'primaryTonal'} size={'md'}
                                pill
                                onClick={() => _handleStatusBtnClick('published')}>Published</Button>
                    </div>
                    <Pagination totalPages={articlesPage?.totalPages}
                                pageSize={articlesPage?.size}
                                page={_fetchParams.page} onChange={_handlePageChange}/>
                </div>
            </div>

            {isFetchingArticlesPage && <div className='flex items-center justify-center py-16'>
                <Spinner size='xl' color='gray'/>
            </div>}

            {!isFetchingArticlesPage && !articlesPage?.items?.length &&
                <div className='flex flex-col items-center justify-center py-16'>
                    <span className='text-lg font-medium text-gray-500'>No articles found.</span>
                    <span className='text-sm'>Change your search criteria and try again or click "Add article" to add new article.</span>
                </div>}

            {!isFetchingArticlesPage && <div className='grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-2'>
                {articlesPage?.items?.map((item: Article) => (
                    <ArticleCard key={item.article_id} article={item}/>
                ))}
            </div>}
        </div>
    )
}