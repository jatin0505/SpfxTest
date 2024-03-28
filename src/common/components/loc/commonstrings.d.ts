declare module 'CommonStrings' {
    import { IButtonStrings, IDialogStrings } from "../Localization";

    interface IValidationStrings {
        Required: string;
        MaximumLength: string;
        Url: string;
    }

    interface IDataRotatorStrings {
        PreviousDateButton: IButtonStrings;
        NextDateButton: IButtonStrings;
    }

    interface IWizardStrings {
        StartButton: IButtonStrings;
        BackButton: IButtonStrings;
        NextButton: IButtonStrings;
        FinishButton: IButtonStrings;
        CancelButton: IButtonStrings;
    }

    interface ICommonStrings {
        Loading: string;
        Saving: string;
        OneMoment: string;
        GenericError: string;
        GenericEmptyListMessage: string;
        Close: string;
        Validation: IValidationStrings;
        ConfirmDialogDefaults: IDialogStrings;
        ConfirmDeleteDialog: IDialogStrings;
        ConfirmDiscardDialog: IDialogStrings;
        DateRotator: IDataRotatorStrings;
        Wizard: IWizardStrings;
    }

    const strings: ICommonStrings;
    export = strings;
}
