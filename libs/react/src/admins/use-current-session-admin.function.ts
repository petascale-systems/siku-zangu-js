"use client"

import {getJSON} from "../get-json.function";
import {Admin, EmailAndPassword} from "@siku-zangu/core";
import {useEffect, useState} from "react";
import {postJSON} from "../post-json.function";

const _SESSIONS_API_PATH = '/api/sessions';
const _CURRENT_SESSION_API_PATH = '/api/sessions/current';

function _fetchCurrentSessionAdmin() {
    return getJSON<Admin>(_CURRENT_SESSION_API_PATH)
}

function _createSession(formData: EmailAndPassword) {
    return postJSON<EmailAndPassword, Admin>(_SESSIONS_API_PATH, formData)
}

export function useCurrentSessionAdmin() {
    const [admin, setAdmin] = useState<Admin>();
    const [isFetchingAdmin, setIsFetchingAdmin] = useState<boolean>(false);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

    async function login(formData: EmailAndPassword) {
        setIsLoggingIn(true);
        return _createSession(formData)
            .then(data => {
                setAdmin(data)
                return data
            })
            .finally(() => setIsLoggingIn(false));
    }

    useEffect(() => {
        setIsFetchingAdmin(true);
        _fetchCurrentSessionAdmin()
            .then(data => setAdmin(data))
            .finally(() => setIsFetchingAdmin(false));
    }, [])

    return {admin, isFetchingAdmin, isLoggingIn, login};
}