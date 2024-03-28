import { Entity } from '../Entity';
import { DataPanelBase, IDataPanelBase, IDataPanelBaseProps, IDataPanelBaseState, DataPanelMode, UpdateDataCallback } from "./DataPanelBase";

export {
    IDataPanelBase,
    IDataPanelBaseProps,
    IDataPanelBaseState,
    DataPanelMode,
    UpdateDataCallback
};

export abstract class EntityPanelBase<T extends Entity<any>, P extends IDataPanelBaseProps<T>, S extends IDataPanelBaseState<T>> extends DataPanelBase<T, P, S> {
    constructor(props: P) {
        super(props);

        this.state = this.resetState();
    }

    protected get entity(): T {
        return this.data;
    }

    protected get isNew(): boolean {
        return this.data && this.data.isNew;
    }

    protected hasChanges(): boolean {
        return this.data && this.data.hasChanges();
    }

    protected readonly updateField = (update: (data: T) => void, callback?: () => any): void => {
        this.setState((prevState: S) => {
            const data = prevState.data;
            update(data);
            return {
                ...prevState,
                data
            };
        }, callback);
    }

    protected validate(): boolean {
        return this.data.valid();
    }

    public readonly(entity: T): Promise<void> {
        entity = entity || this.entity;
        entity.revert();
        return super.readonly(entity);
    }

    public display(entity?: T): Promise<void> {
        entity = entity || this.entity;
        entity.revert();
        return super.display(entity);
    }

    public edit(entity?: T): Promise<void> {
        entity = entity || this.entity;
        if (!this.isReadOnly) {
            entity.snapshot();
        }
        return super.edit(entity);
    }

    public submit(successFn: () => void) {
        super.submit(() => {
            this.data.immortalize();
            successFn();
        });
    }

    public externalDelete(entity?: T) {
        entity = entity || this.entity;
        entity.revert();
        super.externalDelete(entity);
    }

    public delete() {
        this.markEntityDeleted();
        super.delete();
    }

    protected onDeleted() {
        this.entity.immortalize();
    }

    protected markEntityDeleted() {
        this.entity.snapshot();
        this.entity.delete();
    }

    public confirmDiscard() {
        if (this.hasChanges() && !this.isNew) {
            this.setState({ showConfirmDiscard: true });
        } else {
            this.discard();
        }
    }


    public discard() {
        if (this.entity) {
            this.updateField(
                entity => entity.revert(),
                () => super.discard()
            );
            this.resetOnDiscard();
        }
    }
    public resetOnDiscard(): void { }
}