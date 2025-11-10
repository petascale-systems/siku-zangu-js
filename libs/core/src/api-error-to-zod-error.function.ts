import {APIError} from "./api-error.model";
import {ZodError} from "zod";
import {$ZodIssueCustom} from "zod/v4/core";

export function apiErrorToZodError(e: APIError) {
    const issues = e?.issues?.map(issue =>
        ({code: 'custom', path: issue.path, message: issue.error} as $ZodIssueCustom))
    return new ZodError(issues ?? [])
}