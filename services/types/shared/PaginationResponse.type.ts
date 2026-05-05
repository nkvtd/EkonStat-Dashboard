export type PaginatedList<T> = {
    data: T[];
    meta: {
        nextCursor: string | null;
        pageSize: number;
        hasMore: boolean;
    };
};
