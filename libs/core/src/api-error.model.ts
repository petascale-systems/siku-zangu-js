export type APIError = {
    status?: 400 | 401 | 403 | 404 | 405 | 409 | 415 | 422 | 500 | 501 | 503;
    message?: string
    issues?: { path?: string[], error?: string }[];
}