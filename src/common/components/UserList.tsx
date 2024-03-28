import React from "react";
import { css, Label, Persona, PersonaSize } from '@fluentui/react';
import { User } from "../User";

import styles from "./styles/UserList.module.scss";
import { stringIsNullOrEmpty } from "@pnp/common";

export interface IPersonaListProps {
    className?: string;
    label?: string;
    users: User[];
    optionalTitle?: string;
}

const renderUser = (user: User) => {
    return (
        <Persona
            tabIndex={0}
            aria-label={user.title}
            className={styles.persona}
            text={user.title}
            imageUrl={user.picture}
            size={PersonaSize.extraSmall}
        />
    );
};

const renderDefault = (title: string) => {
    return (
        <Persona
            tabIndex={0}
            aria-label={title}
            className={styles.persona}
            text={title}
            size={PersonaSize.extraSmall}
        />
    );
};

export const UserList: React.FC<IPersonaListProps> = (props: IPersonaListProps) => {
    return (
        <div>
            {props.label && <Label tabIndex={0} aria-label={props.label}>{props.label}</Label>}
            <div className={css(styles.personaList, props.className)}>
                {props.users.length == 0 ?
                    stringIsNullOrEmpty(props.optionalTitle)
                        ? <div>&nbsp;</div>
                        : renderDefault(props.optionalTitle)
                    : props.users.map(renderUser)
                }
            </div>
        </div>
    );
};