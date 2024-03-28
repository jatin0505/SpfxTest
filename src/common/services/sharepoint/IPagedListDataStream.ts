export interface IPagedListDataStream<T> {
    results: T[];
    hasNext: boolean;
    hasPrevious: boolean;
    next(): Promise<IPagedListDataStream<T>>;
    previous(): Promise<IPagedListDataStream<T>>;
}