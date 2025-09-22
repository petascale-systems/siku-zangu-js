import {FETCH_CONFIG} from './create-fetch-config.function';
import {APIError} from "@siku-zangu/core";

export async function putJSON<T, U>(path: string, json: T, headers?: HeadersInit): Promise<U | void> {
    return fetch(`${FETCH_CONFIG.host}${path}`,
        {
            credentials: 'include',
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(json),
        })
        .then(async (res) => {
            if (res.status === 204) return;
            if (res.ok) return (await res.json()) as U;

            const err = await res.json()
            return Promise.reject((err ?? {message: 'Failed'}) as APIError);
        })
        .catch(e => Promise.reject((e ?? {message: `Could not POST ${path}`}) as APIError));

}
