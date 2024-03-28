import React from "react";
import { css, IconButton } from "office-ui-fabric-react";

import styles from "./styles/Pager.module.scss";

export interface IPagerProps {
    index: number;
    length: number;
    onPrevious: () => void;
    onNext: () => void;
    className?: string;
}

export const Pager: React.FC<IPagerProps> = (props: IPagerProps) => {
    return (
        <div className={css(styles.pager, props.className)}>
            {props.index != 1 ?
                <IconButton aria-label="Go to Previous Page" iconProps={{ iconName: "ChevronLeft" }} onClick={props.onPrevious} />
                : ""}
            <span className={styles.pages}>{props.index} of {props.length}</span>
            {props.index != props.length ?
                <IconButton aria-label="Go to Next Page" iconProps={{ iconName: "ChevronRight" }} onClick={props.onNext} />
                : ""}
        </div>
    );
};