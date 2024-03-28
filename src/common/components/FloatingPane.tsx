import _ from "lodash";
import React from "react";
import { css } from "office-ui-fabric-react";
import { scrollParent } from "../Utils";
import { StatefulComponent } from "./StatefulComponent";

import styles from "./styles/FloatingPane.module.scss";

export interface IFloatingPaneProps {
    followParentClassName?: string;
    className?: string;
    children: React.ReactNode;
}

export interface IFloatingPaneState {
    heightCss: string;
    topCss: string;
}

const ScrollResponse = 100; // milliseconds for scroll throttling

export class FloatingPane extends StatefulComponent<IFloatingPaneProps, IFloatingPaneState> {
    private _pane: Element;
    private _paneParent: Element;
    private _followParent: Element;
    private _scrollParent: Element;

    constructor(props: IFloatingPaneProps) {
        super(props);

        this.state = {
            heightCss: 'unset',
            topCss: '0px'
        };
    }

    public componentDidMount() {
        window.addEventListener("resize", this._calculatePaneHeight);
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", this._calculatePaneHeight);
        this._detachScrollHandler();
    }

    private readonly _attachScrollHandler = () => {
        if (this._scrollParent) this._scrollParent.addEventListener("scroll", this._calculatePaneTop);
    }

    private readonly _detachScrollHandler = () => {
        if (this._scrollParent) this._scrollParent.removeEventListener("scroll", this._calculatePaneTop);
    }

    private readonly _calculatePaneHeight = () => {
        let heightCss = 'unset';

        if (this._scrollParent) {
            heightCss = this._scrollParent.clientHeight + 'px';
        }

        this.setState({ heightCss: heightCss });

        this._calculatePaneTop();
    }

    private readonly _calculatePaneTop = _.debounce(() => {
        let topCss = '0px';

        if (this._scrollParent) {
            const max = this._followParent.clientHeight - this._pane.clientHeight;
            const followParentTop = this._top(this._followParent);
            const paneParentTop = this._top(this._paneParent);
            const scrollParentTop = this._top(this._scrollParent);
            const value = (paneParentTop == followParentTop) ? scrollParentTop - paneParentTop : 0;

            topCss = Math.min(Math.max(value, 0), max) + 'px';
        }

        this.setState({ topCss: topCss });
    }, ScrollResponse, { trailing: true });

    private readonly _findFollowParent = (element: Element) => {
        let followParent: Element = element;

        if (this.props.followParentClassName) {
            do {
                followParent = followParent.parentElement;
            } while (followParent && followParent.className.search(this.props.followParentClassName) == -1);
        }

        return followParent || element.parentElement;
    }

    private readonly _top = (element: Element) => {
        return element.getBoundingClientRect().top;
    }

    private readonly _paneRef = (pane: Element) => {
        this._detachScrollHandler();

        if (pane) { // this method is also called on component detach and pane will be null at that time
            this._pane = pane;
            this._paneParent = this._pane.parentElement;
            this._followParent = this._findFollowParent(pane);
            this._scrollParent = scrollParent(pane, false);

            this._attachScrollHandler();
            this._calculatePaneHeight();
        }
    }

    public render(): React.ReactElement<void> {
        const heightCss = this.state.heightCss;
        const topCss = this.state.topCss;

        return (
            <div ref={this._paneRef}
                className={css(styles.pane, this.props.className)}
                style={{ maxHeight: heightCss, top: topCss }}
            >
                {this.props.children}
            </div>
        );
    }
}