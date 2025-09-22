export type Page<T> = {
    size?: number;
    page?: number;
    totalPages?: number;
    totalItems?: number;
    items?: T[];
}