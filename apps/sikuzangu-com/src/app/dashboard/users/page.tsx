'use client'

import {KeyboardEvent, useEffect, useState} from "react";
import {Switch, Table, Tbody, Td, Tfoot, Th, Thead, Tr, useUsersPage} from "@siku-zangu/react";
import {Input} from "@headlessui/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {useRouter, useSearchParams} from "next/navigation";
import {User, UsersFetchParams, UserStatus} from "@siku-zangu/core";

export default function UsersPage() {
    const _router = useRouter()
    const _searchParams = useSearchParams()
    const [_search, _setSearch] = useState('')
    const [_usersFetchParams, _setUsersFetchParams] = useState<UsersFetchParams>({
        page: parseInt(`${_searchParams.get('page')}`) || 1,
        size: parseInt(`${_searchParams.get('size')}`) || 20,
        q: _searchParams.get('q') || ''
    })
    const {usersPage, updateUser} = useUsersPage(_usersFetchParams)

    const _handlePageChange = async (page: number) => {
        _updateSearchParams({..._usersFetchParams, page});
    }

    const _handleStatusToggleClick = (userId: string, status: UserStatus) => {
        updateUser(userId, {kv: {status: status}} as User).catch(console.error);
    }

    const _handleQInputEnter = (q: KeyboardEvent<HTMLInputElement>) => {
        if (q.key !== 'Enter') return;
        _updateSearchParams({..._usersFetchParams, page: 1, q: _search});
    }

    const _updateSearchParams = (params: { [key: string]: string | number }) => {
        const queryParams = Object
            .entries(params)
            .filter(e => e[1])
            .map(e => `${e[0]}=${e[1]}`)
            .join('&');
        _router.push(`/dashboard/users?${queryParams}`);
    }

    useEffect(() => {
        _setSearch(_searchParams.get('q') || '')
        _setUsersFetchParams({
            page: parseInt(`${_searchParams.get('page')}`) || 1,
            size: parseInt(`${_searchParams.get('size')}`) || 20,
            q: _searchParams.get('q') || ''
        });
    }, [_searchParams]);

    return (
        <div className='w-full flex flex-col gap-6 p-5'>
            <span className='text-xl font-bold'>User Management</span>
            <div className="w-full bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 shadow-xs">
                <div className='flex justify-between items-center p-4'>
                    <span className='font-medium text-lg text-gray-900'>Users</span>
                    <div className='flex rounded-lg items-center py-2 px-2 border border-gray-200 gap-2'>
                        <MagnifyingGlassIcon className='size-4.5 text-gray-400 stroke-2'/>
                        <Input type="text" placeholder='Search users ...' value={_search}
                               onChange={(e) => _setSearch(e.target.value)}
                               onKeyUp={_handleQInputEnter}
                               className='appearance-none focus:outline-none placeholder:text-gray-300 text-gray-500 md:w-72'/>
                    </div>
                </div>
                <Table>
                    <Thead>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Registration Date</Th>
                        <Th>Status</Th>
                    </Thead>

                    <Tbody>
                        {usersPage?.items?.map((item, index) => (
                            <Tr key={index}>
                                <Td className='font-medium text-gray-900 capitalize'>{`${item?.kv?.first_name} ${item?.kv?.last_name}`}</Td>
                                <Td>{item?.kv?.email || '-'}</Td>
                                <Td>{item?.created_at ? new Date(item?.created_at).toLocaleString() : '-'}</Td>
                                <Td>
                                    <Switch checked={item?.kv?.status == 'active'}
                                            onChange={(active) => _handleStatusToggleClick(item.user_id!, active ? 'active' : 'inactive')}/>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>

                    <Tfoot colSpan={4}
                           pageSize={_usersFetchParams.size}
                           page={usersPage?.page ?? 1}
                           totalPages={usersPage?.totalPages ?? 0}
                           onChange={_handlePageChange}/>
                </Table>
            </div>
        </div>
    )
}