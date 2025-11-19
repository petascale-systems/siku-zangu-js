"use client"

import {Page, User, UsersFetchParams} from "@siku-zangu/core";
import {useEffect, useState} from "react";
import {getJSON} from "../get-json.function";
import {deleteUserById as _deleteUser, updateUser as _updateUser, USERS_API_PATH} from './use-user.function'

async function _fetchUsers(params?: UsersFetchParams) {
    return getJSON<Page<User>>(USERS_API_PATH, params || {});
}

export function useUsersPage(params?: UsersFetchParams) {
    const [usersPage, setUsersPage] = useState<Page<User>>();
    const [isFetchingUsersPage, setIsFetchingUsersPage] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    async function updateUser(userId: string, user: User) {
        setIsUpdatingUser(true);
        return _updateUser(userId, user)
            .then((updated) => {
                if (!updated) return

                setUsersPage({
                    ...usersPage,
                    items: usersPage?.items?.map(u => u.user_id == userId ? updated : u)
                })

                return updated;
            })
            .finally(() => setIsUpdatingUser(false));
    }

    async function deleteUser(userId: string) {
        setIsDeletingUser(true)
        return _deleteUser(userId)
            .then(() => setUsersPage({
                ...usersPage,
                items: usersPage?.items?.filter(u => u.user_id != userId)
            }))
            .finally(() => setIsDeletingUser(false));
    }

    useEffect(() => {
        setIsFetchingUsersPage(true);
        _fetchUsers(params)
            .then(page => setUsersPage(page))
            .finally(() => setIsFetchingUsersPage(false));
    }, [params?.q, params?.page, params?.size]);

    return {usersPage, isFetchingUsersPage, isDeletingUser, isUpdatingUser, updateUser, deleteUser};
}