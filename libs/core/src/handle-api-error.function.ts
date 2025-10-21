'use server'

import {APIError} from "libs/core/src";

export async function handleAPIError(fn: () => Promise<Response>) {
    try {
        return await fn();
    } catch (e: any) {
        if (!e.status || !e.message) console.error(e);
        return Response.json(
            {status: e.status || 500, message: e.message || 'Server error', issues: e.issues ?? []} as APIError,
            {status: e.status || 500}
        );
    }
}