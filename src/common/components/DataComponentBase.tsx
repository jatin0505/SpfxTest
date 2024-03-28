import React from "react";
import * as cstrings from "CommonStrings";
import { DialogFooter, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { AsyncOverlay } from "./AsyncOverlay";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatefulComponent } from "./StatefulComponent";

export type UpdateDataCallback<T> = (update: (data: T) => void, callback?: () => any) => void;

export enum DataComponentMode {
    ReadOnly,
    Display,
    Edit
}

export interface IDataComponentBase<T> {
    valid(showValidationFeedback: boolean): boolean;
    readonly(entity: T): Promise<void>;
    display(entity?: T): Promise<void>;
    edit(entity?: T): Promise<void>;
    externalDelete(entity?: T): void;
    inDisplayMode: boolean;
    inEditMode: boolean;
}

export interface IDataComponentBaseProps<T> {
    componentRef?: (component: IDataComponentBase<T>) => void;
    onDismissed?: () => void;
    className?: string;
    externalDelete?: boolean;
}

export interface IDataComponentBaseState<T> {
    data: T;
    mode: DataComponentMode;
    showValidationFeedback: boolean;
    submitting: boolean;
    showConfirmDiscard: boolean;
    showConfirmDelete: boolean;
    errorMessage: string;
}

export abstract class DataComponentBase<T, P extends IDataComponentBaseProps<T>, S extends IDataComponentBaseState<T>> extends StatefulComponent<P, S> implements IDataComponentBase<T> {
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
            data: null,
            mode: DataComponentMode.Display,
            showValidationFeedback: false,
            submitting: false,
            showConfirmDiscard: false,
            showConfirmDelete: false,
            errorMessage: null
        } as S;
    }

    public componentDidMount() {
        if (this.props.componentRef)
            this.props.componentRef(this);
    }

    protected get data(): T {
        return this.state.data;
    }

    protected get isReadOnly(): boolean {
        return this.state.mode == DataComponentMode.ReadOnly;
    }

    public get inDisplayMode(): boolean {
        return this.state.mode == DataComponentMode.Display || this.state.mode == DataComponentMode.ReadOnly;
    }

    public get inEditMode(): boolean {
        return this.state.mode == DataComponentMode.Edit;
    }

    public valid = (showValidationFeedback: boolean = true): boolean => {
        this.setState({ showValidationFeedback });
        return this.validate();
    }

    protected abstract validate(): boolean;

    public readonly(entity: T): Promise<void> {
        entity = entity || this.data;

        this.setState({
            data: entity,
            mode: DataComponentMode.ReadOnly,
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
            data: entity,
            mode: DataComponentMode.Display,
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
                data: entity,
                mode: DataComponentMode.Edit
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
        const onDiscard = () => this.discard();
        const onDelete = () => this.delete();

        const footerElements = this.renderFooterElements() || [];

        return (
            <div>
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
                <ConfirmDialog
                    show={this.state.showConfirmDelete}
                    strings={cstrings.ConfirmDeleteDialog}
                    disabled={this.state.submitting}
                    onAccept={onDelete}
                    onReject={() => {
                        this.props.externalDelete
                            ? this.setState({ data: null, showConfirmDelete: false }, () => {
                                if (this.props.onDismissed)
                                    this.props.onDismissed();
                            })
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