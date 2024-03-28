import React from "react";
import * as cstrings from "CommonStrings";
import { css, Dialog, DialogFooter, MessageBar, MessageBarType, IModalProps } from "office-ui-fabric-react";
import { AsyncOverlay } from "./AsyncOverlay";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatefulComponent } from "./StatefulComponent";

import styles from "./styles/DataDialogBase.module.scss";

export type UpdateDataCallback<T> = (update: (data: T) => void, callback?: () => any) => void;

export enum DataDialogMode {
    ReadOnly,
    Display,
    Edit
}

export interface IDataDialogBase<T> {
    valid(showValidationFeedback: boolean): boolean;
    readonly(entity: T): Promise<void>;
    display(entity?: T): Promise<void>;
    edit(entity?: T): Promise<void>;
    externalDelete(entity?: T): void;
    inDisplayMode: boolean;
    inEditMode: boolean;
}

export interface IDataDialogBaseProps<T> {
    componentRef?: (component: IDataDialogBase<T>) => void;
    onDismissed?: () => void;
    title?: string;
    className?: string;
    externalDelete?: boolean;
}

export interface IDataDialogBaseState<T> {
    hidden: boolean;
    data: T;
    mode: DataDialogMode;
    showValidationFeedback: boolean;
    submitting: boolean;
    showConfirmDiscard: boolean;
    showConfirmDelete: boolean;
    errorMessage: string;
}

export abstract class DataDialogBase<T, P extends IDataDialogBaseProps<T>, S extends IDataDialogBaseState<T>> extends StatefulComponent<P, S> implements IDataDialogBase<T> {
    private _accept: () => void;
    private _discard: () => void;

    constructor(props: P) {
        super(props);

        this.state = this.resetState();
    }

    protected resetState(): S {
        this._accept = () => { };
        this._discard = () => { };

        return {
            hidden: true,
            data: null,
            mode: DataDialogMode.Display,
            showValidationFeedback: false,
            submitting: false,
            showConfirmDiscard: false,
            showConfirmDelete: false,
            errorMessage: null
        } as S;
    }

    public componentDidMount() {
        this.props.componentRef(this);
    }

    protected get title(): string {
        return this.props.title;
    }

    protected get data(): T {
        return this.state.data;
    }

    protected get isReadOnly(): boolean {
        return this.state.mode == DataDialogMode.ReadOnly;
    }

    public get inDisplayMode(): boolean {
        return this.state.mode == DataDialogMode.Display || this.state.mode == DataDialogMode.ReadOnly;
    }

    public get inEditMode(): boolean {
        return this.state.mode == DataDialogMode.Edit;
    }

    public valid(showValidationFeedback: boolean = true): boolean {
        this.setState({ showValidationFeedback });
        return this.validate();
    }

    protected abstract validate(): boolean;

    public readonly(entity: T): Promise<void> {
        entity = entity || this.data;

        this.setState({
            hidden: false,
            data: entity,
            mode: DataDialogMode.ReadOnly,
            errorMessage: null
        } as S);

        return new Promise<void>((resolve, reject) => {
            this._accept = resolve;
            this._discard = reject;
        });
    }

    public display(entity?: T): Promise<void> {
        entity = entity || this.data;

        this.setState({
            hidden: false,
            data: entity,
            mode: DataDialogMode.Display,
            errorMessage: null
        } as S);

        return new Promise<void>((resolve, reject) => {
            this._accept = resolve;
            this._discard = reject;
        });
    }

    public edit(entity?: T): Promise<void> {
        entity = entity || this.data;

        if (!this.isReadOnly) {
            this.setState({
                hidden: false,
                data: entity,
                mode: DataDialogMode.Edit
            } as S);
        }

        return new Promise<void>((resolve, reject) => {
            this._accept = resolve;
            this._discard = reject;
        });
    }

    protected submit(successFn: () => void) {
        if (this.valid()) {
            this.submitting(true);
            this.persistChanges(successFn);
        }
    }

    protected submitting(val: boolean) {
        this.setState({ submitting: val });
    }

    protected confirmDelete() {
        this.setState({ showConfirmDelete: true });
    }

    public externalDelete(entity?: T) {
        entity = entity || this.data;

        this.setState({
            data: entity
        } as S, () => this.confirmDelete());
    }

    protected delete() {
        this.submitting(true);

        this.persistChanges(() => {
            this.onDeleted();
            this.dismiss();
        });
    }

    protected onDeleted() {
    }

    public confirmDiscard() {
        this.dismiss();
    }

    public discard() {
        this._discard();
        this.dismiss();
    }

    public dismiss() {
        if (this.data) {
            this.setState(this.resetState());

            if (this.props.onDismissed) {
                this.props.onDismissed();
            }
        }
    }

    public error(msg: string = cstrings.GenericError) {
        this.setState({
            submitting: false,
            errorMessage: msg
        });
    }

    protected persistChanges(successFn: () => void) {
        this.persistChangesCore().then(() => {
            this.submitting(false);
            this._accept();
            successFn();
        }).catch(error => {
            console.error(error);
            this.error();
        });
    }

    protected abstract persistChangesCore(): Promise<void>;

    public render(): React.ReactElement<P> {
        const onConfirmDiscard = () => this.confirmDiscard();
        const onDiscard = () => this.discard();
        const onDelete = () => this.delete();

        const footerElements = this.renderFooterElements() || [];

        return (
            <div>
                <Dialog
                    title={this.title}
                    modalProps={{
                        className: css(styles.dataDialogBase, this.props.className),
                        isBlocking: true,
                        isDarkOverlay: true
                    } as IModalProps}
                    hidden={this.state.hidden}
                    closeButtonAriaLabel={cstrings.Close}
                    onDismiss={onConfirmDiscard}>
                    <div>
                        {this.state.errorMessage &&
                            <MessageBar messageBarType={MessageBarType.error} role="alert">
                                {this.state.errorMessage}
                            </MessageBar>
                        }

                        {this.data && this.renderContent()}

                        <AsyncOverlay show={this.state.submitting} label={cstrings.Saving} />
                    </div>

                    {this.data && footerElements.length > 0 &&
                        <DialogFooter>
                            {footerElements}
                        </DialogFooter>
                    }

                    <ConfirmDialog
                        show={this.state.showConfirmDiscard}
                        strings={cstrings.ConfirmDiscardDialog}
                        onAccept={onDiscard}
                        onReject={() => this.setState({ showConfirmDiscard: false })} />
                </Dialog>
                <ConfirmDialog
                    show={this.state.showConfirmDelete}
                    strings={cstrings.ConfirmDeleteDialog}
                    onAccept={onDelete}
                    onReject={() => {
                        this.props.externalDelete
                            ? this.setState({ data: null, showConfirmDelete: false })
                            : this.setState({ showConfirmDelete: false });
                    }} />
            </div>
        );
    }

    protected renderContent(): React.ReactNode {
        if (this.isReadOnly)
            return this.renderReadOnlyContent() || this.renderDisplayContent();
        else if (this.inDisplayMode)
            return this.renderDisplayContent();
        else if (this.inEditMode)
            return this.renderEditContent();
    }

    protected renderReadOnlyContent(): React.ReactNode { return null; }
    protected renderDisplayContent(): React.ReactNode { return null; }
    protected renderEditContent(): React.ReactNode { return null; }

    protected renderFooterElements(): React.ReactNode[] {
        if (this.isReadOnly)
            return this.renderReadOnlyFooterElements() || this.renderDisplayFooterElements();
        else if (this.inDisplayMode)
            return this.renderDisplayFooterElements();
        else if (this.inEditMode)
            return this.renderEditFooterElements();
    }

    protected renderReadOnlyFooterElements(): React.ReactNode[] { return []; }
    protected renderDisplayFooterElements(): React.ReactNode[] { return null; }
    protected renderEditFooterElements(): React.ReactNode[] { return null; }
}