export type APIError = {
    message?: string
    issues?: { path?: string[], error?: string }[];
}