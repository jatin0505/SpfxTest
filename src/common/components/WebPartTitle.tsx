import React from "react";
import { css, Label } from 'office-ui-fabric-react';

import styles from "./styles/WebPartTitle.module.scss";

export interface IWebPartTitleProps {
    title: string;
    className?: string;
    show?: boolean;
    children?: React.ReactNode;
}

export const WebPartTitle: React.FC<IWebPartTitleProps> = (props: IWebPartTitleProps) => {
    return (
        <div className={css(styles.webPartTitle, props.className)}>
            {props.show && <Label><h2 role="heading" aria-level={2} tabIndex={0}>{props.title}</h2></Label>}
            {props.children}
        </div>
    );
};

WebPartTitle.defaultProps = {
    show: true
};