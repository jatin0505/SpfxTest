import React from "react";
import { css, Icon, DelayedRender } from "office-ui-fabric-react";
import { Entity } from "../Entity";
import { ValidationRule } from "../ValidationRules";

export interface IValidationProps<E extends Entity<any>> extends React.HTMLAttributes<HTMLElement | React.FC<IValidationProps<E>>> {
    active: boolean;
    entity: E;
    rules: ValidationRule<E>[];
    errorMessageID?: string;
}

export const Validation = <E extends Entity<any>>(props: IValidationProps<E>) => {
    const {
        active,
        entity,
        rules,
        children,
        errorMessageID
    } = props;

    let valid = true;
    let failMessage = "";

    rules.forEach(rule => {
        if (valid) {
            valid = rule.validate(entity);
            failMessage = !valid ? rule.failMessage : "";
        }
    });

    return (
        <div className={css(props.className, { "validation-error": active && !valid })}>
            {children}
            {active && !valid &&
                <DelayedRender>
                    <p className="error-message ms-font-s ms-fontColor-redDark ms-slideDownIn20">
                        <Icon iconName="Error" />
                        &nbsp;
                        <span aria-live='assertive' id={errorMessageID} data-automation-id='error-message'>{failMessage}</span>
                    </p>
                </DelayedRender>
            }
        </div>
    );
};