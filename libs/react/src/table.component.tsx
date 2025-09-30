import {ReactNode, useEffect, useState} from "react";

export function Th({className = '', colSpan, children}: {
    className?: string,
    colSpan?: number,
    children?: ReactNode
}) {
    return <th className={`text-start font-medium text-gray-500 pl-2.5 py-2.5 ${className}`}
               colSpan={colSpan}>{children}</th>
}

export function Td({className = '', colSpan, children}: {
    className?: string,
    colSpan?: any,
    children?: ReactNode
}) {
    return <td className={`text-start pl-2.5 py-3.5 ${className}`} colSpan={colSpan}>{children}</td>
}

export function Tr({className = '', children}: { className?: string, children?: ReactNode }) {
    return <tr className={`p-0 ${className}`}>{children}</tr>
}

export function Thead({className = '', children}: { className?: string, children?: ReactNode }) {
    return (
        <thead className={`bg-gray-50 p-0 ${className}`}>
        <Tr>{children}</Tr>
        </thead>
    )
}

export function Tbody({className = '', children}: { className?: string, children?: ReactNode }) {
    return <tbody className={`text-gray-500 text-sm divide-y divide-gray-200 ${className}`}>{children}</tbody>
}

export function Tfoot({colSpan, className = '', page = 1, pageSize = 10, totalPages = 1, onChange}: {
    colSpan: number,
    className?: string,
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
        if (totalPages > 3 && page >= 3 && totalPages - page >= 2) start = page - 1
        if (totalPages > 3 && page >= 3 && totalPages - page < 2) start = totalPages - 2
        const newPages = [] as number[]
        for (let i = start; i <= start + 2; ++i) {
            newPages.push(i)
        }

        setPages(newPages);
    }, [page, pageSize, totalPages]);
    return (
        <tfoot className={`${className}`}>
        <Tr className={`${totalPages == 0 ? 'hidden' : ''}`}>
            <Td colSpan={colSpan}>
                <div className='flex justify-between items-center pr-4 text-sm text-gray-700'>
                    <span className='text-xs space-x-2'>
                        <span>Showing page</span>
                        <span className='font-semibold'>{page}</span>
                        <span>of</span>
                        <span className='font-semibold'>{totalPages}</span>
                    </span>
                    <div className='flex gap-1 justify-end items-center'>
                        <button
                            className='py-1.5 px-4 border rounded-md border-gray-200 cursor-pointer disabled:cursor-not-allowed'
                            disabled={page == 1}
                            onClick={() => _handlePageChange(page - 1)}>
                            Previous
                        </button>
                        {pages.map((num, i) => (
                            <button
                                className={`py-1.5 px-4 border rounded-md border-gray-200 ${num == page ? 'text-secondary bg-secondary/5' : ''}`}
                                key={i}
                                onClick={() => _handlePageChange(num)}>
                                {num}
                            </button>
                        ))}
                        <button
                            className='py-1.5 px-4 border rounded-md border-gray-200 cursor-pointer disabled:cursor-not-allowed'
                            disabled={page == totalPages}
                            onClick={() => _handlePageChange(page + 1)}>
                            Next
                        </button>
                    </div>
                </div>
            </Td>
        </Tr>

        <Tr className={`${totalPages > 0 ? 'hidden' : ''}`}>
            <Td colSpan={colSpan} className='text-gray-700 text-sm'>No data found. Change your search criteria and try
                again.</Td>
        </Tr>
        </tfoot>
    )
}

export function Table({className = '', children}: { className?: string, children?: ReactNode }) {
    return (
        <table className={`w-full table-fixed border-collapse divide-y divide-gray-200 ${className}`}>
            {children}
        </table>
    )
}
