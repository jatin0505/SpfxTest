export interface IButtonStrings {
    Text: string;
    Description?: string;
}

export interface IFieldStrings {
    Label: string;
    Tooltip?: string;
}

export interface IDialogStrings {
    HeadingText: string;
    MessageText: string;
    AcceptButton?: IButtonStrings;
    RejectButton?: IButtonStrings;
}