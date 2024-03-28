export class ErrorHandler {
    private _error: any;

    public readonly catch = (error: any) => {
        this._error = error;
    }

    public readonly throwIfError = () => {
        if (this._error) {
            ErrorHandler.throw(this._error);
        }
    }

    public readonly reportIfError = () => {
        if (this._error) {
            console.error(this._error);
        }
    }

    public static readonly throw = (error: any) => {
        console.error(error);
        throw error;
    }
}