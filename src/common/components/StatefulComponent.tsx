import React from "react";
import { IComponent } from "../IComponent";

export class StatefulComponent<P, S> extends React.Component<P, S> implements IComponent {
    private readonly _unmountHandlers: Set<((component: IComponent) => void)> = new Set();

    constructor(props: P) {
        super(props);

        this.componentShouldRender.bind(this);
    }

    public componentWillUnmount() {
        this._unmountHandlers.forEach(handler => handler(this));
    }

    public componentShouldRender() {
        this.setState({});
    }

    public readonly attachUnmountHandler = (handler: (component: IComponent) => void): void => {
        this._unmountHandlers.add(handler);
    }

    public readonly detachUnmountHandler = (handler: (component: IComponent) => void): void => {
        this._unmountHandlers.delete(handler);
    }
}