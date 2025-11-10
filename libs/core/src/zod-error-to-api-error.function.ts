import {ZodError} from "zod";
import {APIError} from "./api-error.model";

export function zodErrorToApiError(e: ZodError) {
    const issues = e.issues.map(i => ({
        path: i.path,
        error: i.message,
    }));

    return {status: 400, message: 'Bad request', issues} as APIError;
}