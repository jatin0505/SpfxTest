import { ListItemResult } from "./ListItemResult";

export class ListDataResult<T extends ListItemResult> {
    public FilterLink: string;
    public FirstRow: number;
    public LastRow: number;
    public NextHref: string;
    public PrevHref: string;
    public RowLimit: number;
    public Row: T[];
}