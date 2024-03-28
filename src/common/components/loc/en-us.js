define([], function () {
    return {
        Loading: "Loading...",
        Saving: "Saving...",
        OneMoment: "One moment...",
        GenericError: "Sorry, something went wrong.",
        GenericEmptyListMessage: "We can't find anything to show here.",
        Close: "Close",
        Validation: {
            Required: "This field is required.",
            MaximumLength: "This field cannot have more than {0} characters.",
            Url: "This field must be a valid Url"
        },
        ConfirmDialogDefaults: {
            HeadingText: "Confirm",
            MessageText: "Are you sure?",
            AcceptButton: { Text: "OK", },
            RejectButton: { Text: "Cancel", }
        },
        ConfirmDeleteDialog: {
            HeadingText: "Delete",
            MessageText: "Are you sure you want to delete?",
            AcceptButton: { Text: "Delete", },
            RejectButton: { Text: "Cancel", }
        },
        ConfirmDiscardDialog: {
            HeadingText: "Discard",
            MessageText: "Are you sure you want to discard changes?",
            AcceptButton: { Text: "Discard", },
            RejectButton: { Text: "Keep Editing", }
        },
        DateRotator: {
            PreviousDateButton: { Text: "Previous date" },
            NextDateButton: { Text: "Next date" },
        },
        Wizard: {
            StartButton: { Text: "Start" },
            BackButton: { Text: "Back" },
            NextButton: { Text: "Next" },
            FinishButton: { Text: "Finish" },
            CancelButton: { Text: "Cancel" }
        }
    };
});