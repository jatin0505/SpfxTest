import React from "react";
import * as cstrings from "CommonStrings";
import { css, DialogFooter, Icon, MessageBar, MessageBarType, Panel, PanelType } from 'office-ui-fabric-react';
import { AsyncOverlay } from "./AsyncOverlay";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatefulComponent } from "./StatefulComponent";

import styles from "./styles/DataPanelBase.module.scss";

export type UpdateDataCallback<T> = (update: (data: T) => void, callback?: () => any) => void;

export enum DataPanelMode {
    ReadOnly,
    Display,
    Edit
}

export interface IDataPanelBase<T> {
    valid(showValidationFeedback: boolean): boolean;
    readonly(entity: T): Promise<void>;
    display(entity?: T): Promise<void>;
    edit(entity?: T): Promise<void>;
    inDisplayMode: boolean;
    inEditMode: boolean;
}

export interface IDataPanelBaseProps<T> {
    componentRef?: (component: IDataPanelBase<T>) => void;
    onDismissed?: () => void;
    title?: string;
    className?: string;
    panelType?: PanelType;
}

export interface IDataPanelBaseState<T> {
    hidden: boolean;
    data: T;
    mode: DataPanelMode;
    showValidationFeedback: boolean;
    submitting: boolean;
    showConfirmDiscard: boolean;
    showConfirmDelete: boolean;
    errorMessage: string;
}

export abstract class DataPanelBase<T, P extends IDataPanelBaseProps<T>, S extends IDataPanelBaseState<T>> extends StatefulComponent<P, S> implements IDataPanelBase<T> {
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
            mode: DataPanelMode.Display,
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
        return this.state.mode == DataPanelMode.ReadOnly;
    }

    public get inDisplayMode(): boolean {
        return this.state.mode == DataPanelMode.Display || this.state.mode == DataPanelMode.ReadOnly;
    }

    public get inEditMode(): boolean {
        return this.state.mode == DataPanelMode.Edit;
    }

    public readonly valid = (showValidationFeedback: boolean = true): boolean => {
        this.setState({ showValidationFeedback });
        return this.validate();
    }

    protected abstract validate(): boolean;

    public readonly(entity: T): Promise<void> {
        entity = entity || this.data;

        this.setState({
            hidden: false,
            data: entity,
            mode: DataPanelMode.ReadOnly,
            errorMessage: null
        } as S);

        return new Promise((resolve, reject) => {
            this._accept = resolve;
            this._discard = reject;
        });
    }

    public display(entity?: T): Promise<void> {
        entity = entity || this.data;

        this.setState({
            hidden: false,
            data: entity,
            mode: DataPanelMode.Display,
            errorMessage: null
        } as S);

        return new Promise((resolve, reject) => {
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
                mode: DataPanelMode.Edit
            } as S);
        }

        return new Promise((resolve, reject) => {
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

    protected customSavingLabel(): string {
        return cstrings.Saving;
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
        const onConfirmDiscard = () => this.confirmDiscard();
        const onDelete = () => this.delete();

        const footerElements = this.renderFooterElements() || [];

        return (
            <div>
                <Panel
                    headerText={this.title}
                    className={css(styles.panel, this.props.className)}
                    isOpen={!this.state.hidden}
                    isBlocking={true}
                    type={this.props.panelType || PanelType.medium}
                    closeButtonAriaLabel={cstrings.Close}
                    onDismiss={onConfirmDiscard}
                    onRenderNavigation={() =>
                        <div role="button" aria-label="close" tabIndex={0} className={styles.navigation} onKeyPress={onConfirmDiscard} onClick={onConfirmDiscard}>
                            <Icon className={styles.close} iconName="Cancel" />
                        </div>
                    }>

                    <div>
                        {this.state.errorMessage &&
                            <MessageBar messageBarType={MessageBarType.error} className={styles.errorMessage} role="alert">
                                {this.state.errorMessage}
                            </MessageBar>
                        }

                        {this.data && this.renderContent()}

                        <AsyncOverlay show={this.state.submitting} label={this.customSavingLabel()} />
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
                </Panel>
                <ConfirmDialog
                    show={this.state.showConfirmDelete}
                    strings={cstrings.ConfirmDeleteDialog}
                    onAccept={onDelete}
                    onReject={() => this.setState({ showConfirmDelete: false })} />
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