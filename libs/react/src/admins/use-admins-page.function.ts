"use client"
import {Admin, AdminsFetchParams, Page, User} from "@siku-zangu/core";
import {useEffect, useState} from "react";
import {getJSON} from "../get-json.function";
import {postJSON} from "../post-json.function";
import {patchJSON} from "../patch-json.function";
import {deleteJSON} from "../delete-json.function";

export const ADMINS_API_PATH = "/api/admins";
export const ADMIN_BY_ID_API_PATH = (userId: string) => `/api/admins/${userId}`;

async function _fetchAdmins(params?: AdminsFetchParams) {
    return getJSON<Page<User>>(ADMINS_API_PATH, params || {});
}

async function _createAdmin(admin: Admin) {
    return postJSON<Admin, Admin>(ADMINS_API_PATH, admin);
}

async function _updateAdmin(userId: string, admin: Admin) {
    return patchJSON<Admin, Admin>(ADMIN_BY_ID_API_PATH(userId), admin);
}

async function _deleteAdmin(userId: string) {
    return deleteJSON(ADMIN_BY_ID_API_PATH(userId));
}

export function useAdminsPage(params?: AdminsFetchParams) {
    const [adminsPage, setAdminsPage] = useState<Page<Admin>>();
    const [isFetchingAdminsPage, setIsFetchingAdminsPage] = useState<boolean>();
    const [isCreatingAdmin, setIsCreatingAdmin] = useState<boolean>();
    const [isUpdatingAdmin, setIsUpdatingAdmin] = useState<boolean>();
    const [isDeletingAdmin, setIsDeletingAdmin] = useState<boolean>();

    async function createAdmin(admin: Admin) {
        setIsCreatingAdmin(true);
        return _createAdmin(admin)
            .then(res => {
                setAdminsPage({...adminsPage, items: [...adminsPage?.items ?? [], res]})
                return res;
            })
            .finally(() => setIsCreatingAdmin(false));
    }

    async function updateAdmin(userId: string, admin: Admin) {
        setIsUpdatingAdmin(true);
        return _updateAdmin(userId, admin)
            .then(res => {
                if (res) {
                    setAdminsPage({...adminsPage, items: adminsPage?.items?.map(i => i.user_id === userId ? res : i)})
                }

                return res;
            })
            .finally(() => setIsUpdatingAdmin(false));
    }

    async function deleteAdmin(userId: string) {
        setIsDeletingAdmin(true);
        return _deleteAdmin(userId)
            .then(() => setAdminsPage({...adminsPage, items: adminsPage?.items?.filter(i => i.user_id !== userId)}))
            .finally(() => setIsDeletingAdmin(false));
    }

    useEffect(() => {
        setIsFetchingAdminsPage(true);
        _fetchAdmins(params)
            .then(setAdminsPage)
            .finally(() => setIsFetchingAdminsPage(false));
    }, [params?.page, params?.size, params?.q, params?.role])

    return {
        adminsPage,
        isFetchingAdminsPage,
        isCreatingAdmin,
        isUpdatingAdmin,
        isDeletingAdmin,
        createAdmin,
        updateAdmin,
        deleteAdmin
    };
}