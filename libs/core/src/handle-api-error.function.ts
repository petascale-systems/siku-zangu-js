'use server'

import {APIError} from "./api-error.model";

export async function handleAPIError(fn: () => Promise<Response | void>) {
    try {
        const response = await fn();
        if (response) return response;
        return new Response(null, {status: 204});
    } catch (e: any) {
        if (!e.status || !e.message) console.error(e);
        return Response.json(
            {status: e.status || 500, message: e.message || 'Server error', issues: e.issues ?? []} as APIError,
            {status: e.status || 500}
        );
    }
}