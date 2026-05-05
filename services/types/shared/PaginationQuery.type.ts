export type PaginationQuery = {
    cursor?: string | null;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
};
