export interface IComponent {
    componentShouldRender(): void;
    attachUnmountHandler(handler: (component: IComponent) => void): void;
    detachUnmountHandler(handler: (component: IComponent) => void): void;
}