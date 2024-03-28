import sanitize from 'sanitize-html';
import React from "react";
import { css, Panel, PanelType, DialogFooter, DefaultButton, Link } from "office-ui-fabric-react";
import * as strings from "CommonStrings";
import { IAsyncData } from "../AsyncData";
import { AsyncOverlay } from "./AsyncOverlay";
import { StatefulComponent } from "./StatefulComponent";

import styles from "./styles/AsyncLoadComponent.module.scss";

interface IAsyncDataComponentProps<T> {
    dataAsync: IAsyncData<T>;
    children: (data: T) => React.ReactNode;
    className?: string;
    hideSpinners?: boolean;
    saveLabel?: string;
}

interface IAsyncDataComponentState {
    showErrorDetailsPanel: boolean;
}

export class AsyncDataComponent<T> extends StatefulComponent<IAsyncDataComponentProps<T>, IAsyncDataComponentState> {
    constructor(props: IAsyncDataComponentProps<T>) {
        super(props);

        this.state = {
            showErrorDetailsPanel: false
        };
    }

    public componentDidMount() {
        if (this.props.dataAsync)
            this.props.dataAsync.registerComponentForUpdates(this);
    }

    public componentWillReceiveProps(props: IAsyncDataComponentProps<T>) {
        if (this.props.dataAsync)
            this.props.dataAsync.unregisterComponentForUpdates(this);

        if (props.dataAsync)
            props.dataAsync.registerComponentForUpdates(this);
    }

    private _showErrorDetails = () => {
        this.setState({ showErrorDetailsPanel: true });
    }

    private _dismissErrorDetails = () => {
        this.setState({ showErrorDetailsPanel: false });
    }

    public render(): React.ReactElement<void> {
        const { saveLabel, dataAsync, hideSpinners, className, children } = this.props;
        const { showErrorDetailsPanel } = this.state;
        const { loaded, error, data, saving, done } = dataAsync;
        const spinnersEnabled = !hideSpinners && !error;
        const style = css(className, styles.asyncLoadComponent, { [styles.spinnersEnabled]: spinnersEnabled });

        return (
            <div className={style}>
                {error &&
                    <p className={styles.errorMessage}>
                        {strings.GenericError}&nbsp;&nbsp;
                        <Link className={styles.detailsLink} onClick={this._showErrorDetails}>Show details</Link>
                    </p>
                }
                <Panel headerText="Error Details" isOpen={showErrorDetailsPanel} onDismiss={this._dismissErrorDetails} type={PanelType.medium}>
                    {error &&
                        (error.stack
                            ? <p dangerouslySetInnerHTML={{ __html: sanitize(error.stack) }}></p>
                            : <p>{error.toString()}</p>
                        )
                    }
                    <DialogFooter>
                        <DefaultButton onClick={this._dismissErrorDetails}>Close</DefaultButton>
                    </DialogFooter>
                </Panel>
                {loaded && children(data)}
                {spinnersEnabled && <AsyncOverlay show={!done} label={strings.Loading} />}
                {spinnersEnabled && <AsyncOverlay show={saving} label={saveLabel || strings.Saving} />}
            </div>
        );
    }
}
