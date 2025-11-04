"use client"

import {useEffect, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline";

const _VISIBLE_PAGES = 3;
const _EXTRA_MOVES = 2;

export function Pagination({page = 1, pageSize = 20, totalPages = 1, onChange}: {
    page?: number,
    pageSize?: number,
    totalPages?: number,
    onChange?: (page: number) => void
}) {
    const [pages, setPages] = useState<number[]>([1, 2, 3]);

    const _handlePageChange = (page: number) => {
        if (onChange) onChange(page);
    }

    useEffect(() => {
        let start = 1;
        let end = totalPages;
        if (totalPages > _VISIBLE_PAGES && page >= 3 && totalPages - page >= 2) start = page - 1
        if (totalPages > _VISIBLE_PAGES && page >= 3 && totalPages - page < 2) start = totalPages - 2
        if (end - start > 2) end = start + 2;
        const newPages = [] as number[]
        for (let i = start; i <= end; ++i) {
            newPages.push(i)
        }

        setPages(newPages);
    }, [page, pageSize, totalPages]);

    return (
        <div className='flex justify-between items-center text-sm text-gray-700 gap-4'>
            <span className='text-xs space-x-2'>
                <span>Showing page</span>
                <span className='font-semibold'>{page}</span>
                <span>of</span>
                <span className='font-semibold'>{totalPages}</span>
            </span>
            <div className='flex gap-1 justify-end items-center'>
                <button
                    className='py-1.5 px-2 border rounded-md border-gray-200 cursor-pointer disabled:cursor-not-allowed'
                    disabled={page == 1}
                    onClick={() => _handlePageChange(page - 1)}>
                    <ChevronLeftIcon className='size-5'/>
                </button>
                {pages.map((num, i) => (
                    <button
                        className={`py-1.5 px-4 border rounded-md border-gray-200 cursor-pointer ${num == page ? 'text-secondary bg-secondary/5' : ''}`}
                        key={i}
                        onClick={() => _handlePageChange(num)}>
                        {num}
                    </button>
                ))}
                <button
                    className='py-1.5 px-2 border rounded-md border-gray-200 cursor-pointer disabled:cursor-not-allowed'
                    disabled={page == totalPages}
                    onClick={() => _handlePageChange(page + 1)}>
                    <ChevronRightIcon className='size-5'/>
                </button>
            </div>
        </div>
    )
}