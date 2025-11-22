"use client"

import {getJSON} from "../get-json.function";
import {Admin, EmailAndPassword} from "@siku-zangu/core";
import {useEffect, useState} from "react";
import {postJSON} from "../post-json.function";
import {useRouter} from "next/navigation";
import {deleteJSON} from "../delete-json.function";

const _SESSIONS_API_PATH = '/api/sessions';
const _CURRENT_SESSION_API_PATH = '/api/sessions/current';

async function _fetchCurrentSessionAdmin() {
    return getJSON<Admin>(_CURRENT_SESSION_API_PATH)
}

async function _createSession(formData: EmailAndPassword) {
    return postJSON<EmailAndPassword, Admin>(_SESSIONS_API_PATH, formData)
}

async function _deleteCurrentSession() {
    return deleteJSON(_CURRENT_SESSION_API_PATH)
}

export function useCurrentSessionAdmin() {
    const _router = useRouter();
    const [admin, setAdmin] = useState<Admin>();
    const [isFetchingAdmin, setIsFetchingAdmin] = useState<boolean>(true);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

    async function login(formData: EmailAndPassword) {
        setIsLoggingIn(true);
        return _createSession(formData)
            .then(data => {
                setAdmin(data)
                _router.push('/dashboard')
            })
            .finally(() => setIsLoggingIn(false));
    }

    async function logout() {
        return _deleteCurrentSession().then(() => _router.push('/login'));
    }

    useEffect(() => {
        setIsFetchingAdmin(true);
        _fetchCurrentSessionAdmin()
            .then(data => setAdmin(data))
            .catch(err => {
                if (err.status == 401) _router.push('/login');
            })
            .finally(() => setIsFetchingAdmin(false));
    }, [])

    return {admin, isFetchingAdmin, isLoggingIn, login, logout};
}