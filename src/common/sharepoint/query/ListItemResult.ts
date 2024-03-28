import { UserInfoResult } from "./UserInfoResult";

export class ListItemResult {
    public static readonly viewFields: string[] = [
        "ID",
        "Title",
        "Created",
        "Modified",
        "Author",
        "Editor"
    ];

    public ID: string;
    public Title: string;
    public Created: string;
    public Modified: string;
    public Author: UserInfoResult[];
    public Editor: UserInfoResult[];
}