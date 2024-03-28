import { ListItemResult } from "./ListItemResult";
import { ListDataResult } from "./ListDataResult";

export class ListContextResult<T extends ListItemResult> {
    public AllowGridMode: boolean;
    public BaseViewID: string;
    public displayFormUrl: string;
    public editFormUrl: string;
    public EnableAttachments: boolean;
    public EnableMinorVersions: boolean;
    public ListData: ListDataResult<T>;
    public listTemplate: string;
    public ListTemplateType: string;
    public ListTitle: string;
    public ListUrlDir: string;
    public newFormUrl: string;
    public view: string;
    public viewTitle: string;
}