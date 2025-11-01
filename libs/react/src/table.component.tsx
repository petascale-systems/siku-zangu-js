import {ReactNode} from "react";
import {Pagination} from "./pagination.component";

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
    return <td className={`text-start px-2.5 py-3.5 ${className}`} colSpan={colSpan}>{children}</td>
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

    const _handlePageChange = (page: number) => {
        if (onChange) onChange(page);
    }

    return (
        <tfoot className={`${className}`}>
        <Tr className={`${totalPages == 0 ? 'hidden' : ''}`}>
            <Td colSpan={colSpan}>
                <Pagination page={page} pageSize={pageSize} totalPages={totalPages} onChange={_handlePageChange}/>
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
