import { ContentTypeIdResult } from "./ContentTypeIdResult";

export class ViewResult {
    public Aggregations: string;
    public AggregationsStatus: string;
    public BaseViewId: string;
    public ContentTypeId: ContentTypeIdResult;
    public DefaultView: boolean;
    public DefaultViewForContentType: boolean;
    public Hidden: boolean;
    public HtmlSchemaXml: string;
    public Id: string;
    public ImageUrl: string;
    public IncludeRootFolder: boolean;
    public JSLink: string;
    public ListViewXml: string;
    public MobileDefaultView: boolean;
    public MobileView: boolean;
    public OrderedView: boolean;
    public Paged: boolean;
    public RowLimit: number;
    public ServerRelativeUrl: string;
    public TabularView: boolean;
    public Threaded: boolean;
    public Title: string;
    public Toolbar: string;
    public ViewData: string;
    public ViewQuery: string;
    public ViewType: string;
}