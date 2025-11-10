'use client'

import {useRouter, useSearchParams} from "next/navigation";
import {KeyboardEvent, useEffect, useState} from "react";
import {Admin, AdminsFetchParams, apiErrorToZodError, UserStatus} from "@siku-zangu/core";
import {AdminForm, Switch, Table, Tbody, Td, Tfoot, Th, Thead, Tr, useAdminsPage} from "@siku-zangu/react";
import {MagnifyingGlassIcon, PencilSquareIcon, PlusIcon, TrashIcon, UserIcon} from "@heroicons/react/24/outline";
import {Input} from "@headlessui/react";
import {Button, Drawer, DrawerHeader} from "flowbite-react";
import {ZodError} from "zod";

export default function AdminsPage() {
    const _router = useRouter()
    const _searchParams = useSearchParams()
    const [_showModal, _setShowModal] = useState<boolean>()
    const [_search, _setSearch] = useState('')
    const [_admin, _setAdmin] = useState<Admin>()
    const [_formError, _setFormError] = useState<ZodError>()
    const [_adminsFetchParams, _setAdminsFetchParams] = useState<AdminsFetchParams>({
        page: parseInt(`${_searchParams.get('page')}`) || 1,
        size: parseInt(`${_searchParams.get('size')}`) || 20,
        q: _searchParams.get('q') || ''
    })
    const {
        adminsPage,
        updateAdmin,
        createAdmin,
        deleteAdmin,
        isUpdatingAdmin,
        isCreatingAdmin
    } = useAdminsPage(_adminsFetchParams)

    const _handlePageChange = async (page: number) => {
        _updateSearchParams({..._adminsFetchParams, page});
    }

    const _handleStatusToggleClick = (userId: string, status: UserStatus) => {
        updateAdmin(userId, {status: status}).catch(console.error);
    }

    const _handleQInputEnter = (q: KeyboardEvent<HTMLInputElement>) => {
        if (q.key !== 'Enter') return;
        _updateSearchParams({..._adminsFetchParams, page: 1, q: _search});
    }

    const _updateSearchParams = (params: { [key: string]: string | number }) => {
        const queryParams = Object
            .entries(params)
            .filter(e => e[1])
            .map(e => `${e[0]}=${e[1]}`)
            .join('&');
        _router.push(`/dashboard/admins?${queryParams}`);
    }

    const _handleAddAdminBtnClick = () => {
        _setShowModal(true)
    }

    const _handleCloseModalBtnClick = () => {
        _setAdmin(undefined);
        _setShowModal(false);
        _setFormError(undefined);
    }

    const _handleEditAdminBtnClick = (userId?: string) => {
        if (!userId) return;

        const item = adminsPage?.items?.find(i => i.user_id === userId);
        if (!item) return;

        _setAdmin(item);
        _setShowModal(true);
    }

    const _handleDeleteAdminBtnClick = (userId?: string) => {
        if (!userId) return;

        const admin = adminsPage?.items?.find(a => a.user_id === userId)
        if (!admin) return;

        const confirmMag = `Are you sure you want to delete "${admin?.kv?.first_name} ${admin?.kv?.last_name}". This change cannot be undone.`;
        if (confirm(confirmMag)) deleteAdmin(userId).catch(e => {
            if (e.message) alert(`Delete failed: ${e.message}`);
        });
    }

    const _handleSubmitBtnClick = (admin: Admin) => {
        if (_admin && _admin.user_id) {
            updateAdmin(_admin.user_id, admin)
                .then(_handleCloseModalBtnClick)
                .catch(e => _setFormError(apiErrorToZodError(e)));
            return;
        }

        createAdmin(admin)
            .then(_handleCloseModalBtnClick)
            .catch(e => _setFormError(apiErrorToZodError(e)));
    }

    useEffect(() => {
        _setSearch(_searchParams.get('q') || '')
        _setAdminsFetchParams({
            page: parseInt(`${_searchParams.get('page')}`) || 1,
            size: parseInt(`${_searchParams.get('size')}`) || 20,
            q: _searchParams.get('q') || ''
        });
    }, [_searchParams]);

    return (
        <>
            <div className='w-full flex flex-col gap-6 p-5'>
                <div className='flex justify-between items-center'>
                    <span className='text-xl font-bold'>Admin Management</span>
                    <Button color='secondary' size='md' className='flex items-center gap-2'
                            onClick={_handleAddAdminBtnClick}>
                        <PlusIcon className='size-4'/>
                        <span>Add admin</span>
                    </Button>
                </div>
                <div className="w-full bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 shadow-xs">
                    <div className='flex justify-between items-center p-4'>
                        <span className='font-medium text-lg text-gray-900'>Admins</span>
                        <div className='flex rounded-lg items-center py-2 px-2 border border-gray-200 gap-2'>
                            <MagnifyingGlassIcon className='size-4.5 text-gray-400 stroke-2'/>
                            <Input type="text" placeholder='Search admins ...' value={_search}
                                   onChange={(e) => _setSearch(e.target.value)}
                                   onKeyUp={_handleQInputEnter}
                                   className='appearance-none focus:outline-none placeholder:text-gray-300 text-gray-500 md:w-72'/>
                        </div>
                    </div>
                    <Table>
                        <Thead>
                            <Th>Name</Th>
                            <Th>Email</Th>
                            <Th>Role</Th>
                            <Th>Actions</Th>
                        </Thead>

                        <Tbody>
                            {adminsPage?.items?.map((item, index) => (
                                <Tr key={index}>
                                    <Td className='font-medium text-gray-900 capitalize'>
                                        {`${item?.kv?.first_name} ${item?.kv?.last_name}`}
                                    </Td>
                                    <Td>{item?.kv?.email || '-'}</Td>
                                    <Td>{item.role == 'admin' ? 'Admin' : 'Member'}</Td>
                                    <Td className='flex gap-4 items-center'>
                                        <button onClick={() => _handleEditAdminBtnClick(item.user_id)}><PencilSquareIcon
                                            className='size-5 text-blue-700 stroke-2'/></button>
                                        <button onClick={() => _handleDeleteAdminBtnClick(item.user_id)}><TrashIcon
                                            className='size-5 text-red-700 stroke-2'/></button>
                                        <Switch checked={item?.status == 'active'}
                                                onChange={(active) => _handleStatusToggleClick(item.user_id!, active ? 'active' : 'inactive')}/>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>

                        <Tfoot colSpan={4}
                               pageSize={_adminsFetchParams.size}
                               page={adminsPage?.page ?? 1}
                               totalPages={adminsPage?.totalPages ?? 0}
                               onChange={_handlePageChange}/>
                    </Table>
                </div>
            </div>

            <Drawer open={_showModal} onClose={_handleCloseModalBtnClick} position='right' className='w-full max-w-lg'>
                <DrawerHeader title={_admin ? 'Edit admin' : 'Add admin'}
                              titleIcon={() => <UserIcon className='size-6 stroke-2'/>}/>
                <AdminForm admin={_admin} isLoading={isCreatingAdmin || isUpdatingAdmin} error={_formError}
                           onSubmit={_handleSubmitBtnClick}/>
            </Drawer>
        </>
    )
}