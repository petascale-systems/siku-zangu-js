import {FETCH_CONFIG} from './create-fetch-config.function';
import {authHeaders} from './auth-token.function';
import {APIError} from "@siku-zangu/core";

export async function patchJSON<T, U>(
    path: string,
    json: T,
    headers?: HeadersInit
): Promise<U | void> {
    return fetch(`${FETCH_CONFIG.host}${path}`,
        {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                ...authHeaders(),
                ...headers,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(json)
        })
        .then(async (res) => {
            if (res.status === 204) return;
            if (res.ok) return (await res.json()) as U;

            let err: APIError;
            try {
                err = await res.json();
            } catch {
                err = { status: res.status as APIError['status'], message: res.statusText || 'Request failed', issues: [] };
            }
            return Promise.reject((err ?? {message: 'Failed'}) as APIError);
        })
        .catch(e => Promise.reject((e ?? {message: `Could not PATCH ${path}`}) as APIError));
}
