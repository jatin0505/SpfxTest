import React from "react";
import { ColorPicker, Callout, Label, IColor } from "office-ui-fabric-react";
import { Color } from "../Color";
import { StatefulComponent } from "./StatefulComponent";

import styles from "./styles/CalloutColorPicker.module.scss";

export interface ICalloutColorPickerProps {
    label?: string;
    required?: boolean;
    hideAlpha?: boolean;
    color: Color;
    onChanged: (value: Color) => void;
}

export interface ICalloutColorPickerState {
    isOpen: boolean;
}

export class CalloutColorPicker extends StatefulComponent<ICalloutColorPickerProps, ICalloutColorPickerState> {
    public static defaultProps: Partial<ICalloutColorPickerProps> = {
        label: "",
        required: false,
        hideAlpha: false
    };

    private _colorPreviewElement: HTMLElement;

    public constructor(props: ICalloutColorPickerProps) {
        super(props);

        this.state = {
            isOpen: false
        };
    }

    public render(): JSX.Element {
        const isOpen = this.state.isOpen;

        return (
            <div className={styles.calloutColorPicker}>
                {this.props.label && <Label>{this.props.label}</Label>}
                <div
                    style={{ backgroundColor: this.props.color.toHexString() }}
                    className={styles.colorPreview}
                    ref={element => this._colorPreviewElement = element}
                    onClick={() => this.setState({ isOpen: !isOpen })}
                />
                {isOpen &&
                    <Callout
                        isBeakVisible={false}
                        onDismiss={() => this.setState({ isOpen: false })}
                        preventDismissOnScroll={true}
                        target={this._colorPreviewElement}
                        gapSpace={0}
                    >
                        <ColorPicker
                            color={this.props.color.iColor || this.props.color.toCssString()}
                            alphaSliderHidden={this.props.hideAlpha}
                            onChange={(ev: React.SyntheticEvent<HTMLElement>, color: IColor) => {
                                if (color)
                                    this.props.onChanged(Color.parse(color.str, color));
                            }}
                        />
                    </Callout>
                }
            </div>
        );
    }
}