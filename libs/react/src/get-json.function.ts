import {FETCH_CONFIG} from './create-fetch-config.function';
import {APIError} from "@siku-zangu/core";

export async function getJSON<U>(
    path: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
    headers?: HeadersInit
) {
    let url = `${FETCH_CONFIG.host}${path}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== null && value !== undefined) {
                searchParams.append(key, value.toString());
            }
        }

        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    return fetch(url,
        {
            credentials: 'include',
            method: 'GET',
            headers: {
                ...headers,
                Accept: 'application/json',
                'Cache-Control': 'no-cache',
            },
        })
        .then(async (res) => {
            if (res.ok) return (await res.json()) as U;

            const err = await res.json()
            return Promise.reject((err ?? {message: 'Failed'}) as APIError);
        })
        .catch(e => Promise.reject((e ?? {message: `Could not GET ${path}`}) as APIError));
}
