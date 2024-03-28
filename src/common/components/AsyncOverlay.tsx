import React from "react";
import * as cstrings from "CommonStrings";
import { css, Overlay, Spinner, SpinnerSize } from 'office-ui-fabric-react';

import styles from "./styles/AsyncOverlay.module.scss";

export interface IAsyncOverlayProps {
    show: boolean;
    label?: string;
    className?: string;
}

export const AsyncOverlay: React.FC<IAsyncOverlayProps> = (props: IAsyncOverlayProps) => {
    const className: string = css(styles.asyncOverlay, props.className);
    return (props.show &&
        <Overlay className={className}>
            <Spinner size={SpinnerSize.large} label={props.label} />
        </Overlay>
        || null
    );
};

AsyncOverlay.defaultProps = {
    label: cstrings.OneMoment
};