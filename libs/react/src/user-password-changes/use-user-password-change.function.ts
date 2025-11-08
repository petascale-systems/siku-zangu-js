import {useEffect, useState} from "react";
import {Password, UserPasswordChange} from "@siku-zangu/core";
import {getJSON} from "../get-json.function";
import {patchJSON} from "../patch-json.function";
import {useRouter} from "next/navigation";

export const USER_PASSWORD_CHANGE_BY_ID_API_PATH = (id: string) => `/api/password-changes/${id}`

async function _fetchUserPasswordChange(passwordChangeId: string) {
    return getJSON<UserPasswordChange>(USER_PASSWORD_CHANGE_BY_ID_API_PATH(passwordChangeId));
}

async function _changePassword(passwordChangeId: string, password: Password) {
    return patchJSON<Password, void>(USER_PASSWORD_CHANGE_BY_ID_API_PATH(passwordChangeId), password);
}

export function useUserPasswordChange(passwordChangeId: string) {
    const _router = useRouter();
    const [passwordChange, setPasswordChange] = useState<UserPasswordChange>();
    const [isFetchingPasswordChange, setIsFetchingPasswordChange] = useState<boolean>();

    async function changePassword(password: Password) {
        if (!passwordChangeId) return Promise.reject('passwordChangeId is required');

        setIsFetchingPasswordChange(true);
        return _changePassword(passwordChangeId, password)
            .then(() => _router.push('/login'))
            .finally(() => setIsFetchingPasswordChange(false));
    }

    useEffect(() => {
        if (!passwordChangeId) return;

        setIsFetchingPasswordChange(true);
        _fetchUserPasswordChange(passwordChangeId)
            .then(setPasswordChange)
            .catch(() => _router.push('/login'))
            .finally(() => setIsFetchingPasswordChange(false));
    }, [passwordChangeId]);

    return {passwordChange, changePassword, isFetchingPasswordChange}
}