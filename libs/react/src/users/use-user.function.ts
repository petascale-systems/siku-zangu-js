import {useEffect, useState} from "react";
import {User} from "@siku-zangu/core";
import {getJSON} from "../get-json.function";
import {postJSON} from "../post-json.function";
import {patchJSON} from "../patch-json.function";
import {deleteJSON} from "../delete-json.function";

export const USERS_API_PATH = "/api/users";
export const USER_BY_ID_API_PATH = (id: string) => `/api/users/${id}`

async function _fetchUserById(id: string) {
    return getJSON<User>(USER_BY_ID_API_PATH(id));
}

async function _createUser(user: User) {
    return postJSON<User, User>(USERS_API_PATH, user);
}

export async function _updateUser(userId: string, user: User) {
    return patchJSON<User, User>(USER_BY_ID_API_PATH(userId), user);
}

export async function _deleteUser(userId: string) {
    return deleteJSON<User>(USER_BY_ID_API_PATH(userId));
}

export function useUser(userId?: string) {
    const [user, setUser] = useState<User>();
    const [isFetchingUser, setIsFetchingUser] = useState(false);
    const [isUpsertingUser, setIsUpsertingUser] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    async function upsertUser(user: User) {
        setIsUpsertingUser(true);
        return (userId ? _updateUser(userId, user) : _createUser(user))
            .then((upsertedUser) => {
                if (upsertedUser) setUser(upsertedUser)
                return upsertedUser;
            })
            .finally(() => setIsUpsertingUser(false));
    }

    async function deleteUser() {
        if (!userId) return;

        setIsDeletingUser(true)
        return _deleteUser(userId)
            .then(() => setUser(undefined))
            .finally(() => setIsDeletingUser(false));
    }

    useEffect(() => {
        if (!userId) return

        setIsFetchingUser(true);
        _fetchUserById(userId).then(setUser).finally(() => setIsFetchingUser(false));
    }, [userId]);

    return {user, isFetchingUser, isUpsertingUser, isDeletingUser, upsertUser, deleteUser};
}