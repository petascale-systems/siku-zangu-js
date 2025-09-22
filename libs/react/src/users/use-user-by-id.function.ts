import {useEffect, useState} from "react";
import {User} from "@siku-zangu/core";
import {getJSON} from "../get-json.function";

const _USER_BY_ID_PATH = (id: string) => `/api/users/${id}`

async function _fetchUserById(id: string) {
    return getJSON<User>(_USER_BY_ID_PATH(id));
}

export function useUserById(id?: string) {
    const [user, setUser] = useState<User>();
    const [isFetchingUser, setIsFetchingUser] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return

        setIsFetchingUser(true);
        _fetchUserById(id).then(setUser).finally(() => setIsFetchingUser(false));
    }, [id]);
    return {user, isFetchingUser};
}