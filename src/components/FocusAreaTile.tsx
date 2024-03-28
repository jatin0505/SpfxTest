import React, { Component, ReactElement } from "react";
import { css, Icon } from '@fluentui/react';
import { FocusAreaAssignment } from "model";
import styles from "./styles/FocusAreaTile.module.scss";
import { GridCol, GridRow } from "common/components";

export interface IFocusAreaTileProps {
    focusAreaStatus: string;
    focusAreaAssignment: FocusAreaAssignment;
    onSelectedFocusArea?: (assign: FocusAreaAssignment) => void;
    isEdited?: boolean;
}
export class FocusAreaTile extends Component<IFocusAreaTileProps>{
    constructor(props: IFocusAreaTileProps) {
        super(props);
    }

    private readonly openFocusAreaEditor = () => {
        const { onSelectedFocusArea, focusAreaAssignment } = this.props;
        onSelectedFocusArea(focusAreaAssignment);
    }

    public render(): ReactElement<IFocusAreaTileProps> {
        const cssClass = css(styles.focusAreaTile);
        const { focusAreaAssignment, focusAreaStatus, isEdited } = this.props;
        let colorBlockCSS = focusAreaStatus == "Completed" ? styles.focusAreaCompletedColorBlock : focusAreaStatus == "Current Program" ? styles.focusAreaCurrentColorBlock : styles.focusAreaNextColorBlock;
        let focusArea_StartDate = focusAreaAssignment && focusAreaAssignment.startDate ? focusAreaAssignment.startDate.format('MMM DD, YYYY') : "-";
        let focusArea_EndDate = focusAreaAssignment && focusAreaAssignment.endDate ? focusAreaAssignment.endDate.format('MMM DD, YYYY') : "-";
        let focusArea_Manager = focusAreaAssignment && focusAreaAssignment.focusAreaManager ? focusAreaAssignment.focusAreaManager.title : focusAreaAssignment.focusAreaManagerName;
        let focusArea_Status = focusAreaAssignment && focusAreaAssignment.status ? focusAreaAssignment.status.name : "-";
        let isTileEnable = focusAreaStatus == "Completed" || !isEdited ? "disable" : "enable";
        return (
            <div role="listitem">
                <div className={cssClass} tabIndex={focusAreaStatus == "Completed" ? -1 : this.props.isEdited ? 0 : -1} role="button"
                    onKeyPress={(e: any) => e.key = "Enter" ? focusAreaStatus == "Completed" ? "" : this.openFocusAreaEditor() : ''}
                    onClick={() => focusAreaStatus == "Completed" ? "" : this.openFocusAreaEditor()}
                    aria-label={isTileEnable + " " + focusAreaStatus + " " +
                        (focusAreaAssignment.focusArea ? focusAreaAssignment.focusArea.displayName : "") +
                        " from " + focusArea_StartDate + " to " + focusArea_EndDate + " Manager " + focusArea_Manager + " Status " + focusArea_Status
                    }>
                    <div className={css(colorBlockCSS)}></div>
                    <div className={css(styles.focusAreaTileContent)}>
                        <div>
                            <div className={styles.label}>{focusAreaAssignment && focusAreaAssignment.focusArea ? focusAreaAssignment.focusArea.title : "-"}</div>
                        </div>
                        <GridRow className={styles.grids}>
                            <GridCol sm={12} md={5}>
                                From <div className={styles.datelabel}>{focusArea_StartDate}</div> to <div className={styles.datelabel}>{focusArea_EndDate}</div>
                            </GridCol>
                            <GridCol sm={12} md={4}>
                                {"Manager "} <div className={styles.managerLabel}>{focusArea_Manager}</div>
                            </GridCol>
                            <GridCol sm={12} md={3}>
                                <div className={focusAreaStatus == "Next Program" ? css(styles.iconDivNext) : css(styles.iconDiv)}>{focusArea_Status}</div>
                                <Icon className={focusAreaStatus == "Next Program" ? css(styles.arrowIcon) : css(styles.icon)}
                                    iconName={focusAreaStatus == "Completed" ? "SkypeCircleCheck" : focusAreaStatus == "Current Program" ? "AccountManagement" : "IncreaseIndentArrow"}></Icon>
                            </GridCol>
                        </GridRow>
                    </div >
                </div>
            </div>
        );
    }
}