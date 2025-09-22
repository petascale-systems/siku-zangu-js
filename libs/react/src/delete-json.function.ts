import {FETCH_CONFIG} from './create-fetch-config.function';
import {APIError} from "@siku-zangu/core";

export async function deleteJSON<U = void>(
    path: string,
    headers?: HeadersInit
) {
    return fetch(`${FETCH_CONFIG.host}${path}`,
        {
            credentials: 'include',
            method: 'DELETE',
            headers: {
                ...headers,
                Accept: 'application/json',
            },
        })
        .then(async (res) => {
            if (res.status === 204) return;
            if (res.ok) return (await res.json()) as U;

            const err = await res.json()
            return Promise.reject((err ?? {message: 'Failed'}) as APIError);
        })
        .catch(e => Promise.reject((e ?? {message: `Could not DELETE ${path}`}) as APIError));
}
