import React from "react";
import { ListPeoplePicker, NormalPeoplePicker, CompactPeoplePicker, IPersonaProps, Icon, Label, TooltipHost, IBasePickerSuggestionsProps } from '@fluentui/react';
import { withServices, ServicesProp, DirectoryServiceProp, DirectoryService, IDirectoryService } from 'common/services';
import { User } from '../User';
import * as strings from 'ComponentStrings';

import styles from './styles/UserPicker.module.scss';

const maximumSuggestions = 10;

export enum UserPickerDisplayOption {
    Normal,
    List,
    Compact
}

export type OnChangedCallback = (users: User[]) => void;

interface IOwnProps {
    label: string;
    tooltipText?: string;
    required?: boolean;
    display?: UserPickerDisplayOption;
    showLabel?: boolean;
    users: User[];
    itemLimit?: number;
    onChanged: OnChangedCallback;
    disabled?: boolean;
    validationMessage?: string;
}

type IUserPickerProps = IOwnProps & ServicesProp<DirectoryServiceProp>;

interface IUserPersonaProps extends IPersonaProps {
    user: User;
}

const userToUserPersona = (user: User): IUserPersonaProps => {
    return {
        imageUrl: user.picture,
        text: user.title,
        secondaryText: user.email,
        user: user
    };
};

const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: 'Suggested People',
    mostRecentlyUsedHeaderText: 'Suggested Contacts',
    noResultsFoundText: 'No results found',
    loadingText: 'Loading',
    showRemoveButtons: true,
    suggestionsAvailableAlertText: 'People Picker Suggestions available',
    suggestionsContainerAriaLabel: 'Suggested contacts',
};

const containsUser = (list: User[], user: User) => {
    return list.some(item => item.email === user.email);
};

const removeDuplicateUsers = (suggestedUsers: User[], currentUsers: User[]) => {
    return suggestedUsers.filter(user => !containsUser(currentUsers, user));
};

const extractEmailAddress = (input: string): string => {
    const emailAddress = /<.+?>/g.exec(input);

    if (emailAddress && emailAddress[0]) {
        return emailAddress[0].substring(1, emailAddress[0].length - 1).trim();
    } else {
        return input.trim();
    }
};
const extractEmailAddresses = (input: string): string[] => {
    return input.split(';').map(extractEmailAddress).filter(t => t);
};

const isListOfEmailAddresses = (input: string): boolean => {
    return input.indexOf(';') != -1 && input.length > 10;
};

const resolveSuggestions = (searchText: string, currentUserPersonas: IUserPersonaProps[], directoryService: IDirectoryService, onChangedFn: OnChangedCallback): Promise<IUserPersonaProps[]> | IUserPersonaProps[] => {
    if (searchText) {
        const currentUsers = currentUserPersonas.map(userPersona => userPersona.user);

        if (isListOfEmailAddresses(searchText)) {
            return directoryService.resolve(extractEmailAddresses(searchText)).then(resolvedUsers => {
                const nextUsers = [
                    ...currentUsers,
                    ...removeDuplicateUsers(resolvedUsers, currentUsers)
                ];
                onChangedFn(nextUsers);
                return [];
            });
        }
        else {
            return directoryService.search(searchText).then(suggestedUsers => {
                const suggestedUserPersonas = suggestedUsers.slice(0, maximumSuggestions);
                return removeDuplicateUsers(suggestedUserPersonas, currentUsers).map(userToUserPersona);
            });
        }
    } else {
        return [];
    }
};

const UserPicker: React.FC<IUserPickerProps> = (props: IUserPickerProps) => {
    const userPersonas = props.users.map(userToUserPersona);

    const onChange = (items: IPersonaProps[]) => {
        if (!props.disabled)
            props.onChanged((items as IUserPersonaProps[]).map(userPersona => userPersona.user));
    };

    const onResolveSuggestions = (filter: string, selectedItems: IPersonaProps[]) =>
        resolveSuggestions(filter, selectedItems as IUserPersonaProps[], props.services[DirectoryService], props.onChanged);

    const renderPicker = () => {
        let inputPropsArialLabel = { 'aria-label': props.label + ' Field. ' + props.validationMessage };
        let inputPropsPlaceholder = {
            'aria-label': props.label + ' Field. ' + props.validationMessage,
            placeholder: props.label,
        };
        let inputPropsRequired = {
            'required': props.required,
            'aria-label': props.label + ' Field. ' + props.validationMessage
        };
        switch (props.display) {
            case UserPickerDisplayOption.Normal:
                return <NormalPeoplePicker
                    selectedItems={userPersonas}
                    onResolveSuggestions={onResolveSuggestions}
                    onChange={onChange}
                    itemLimit={props.itemLimit}
                    disabled={props.disabled}
                    inputProps={props.showLabel ? inputPropsArialLabel : inputPropsPlaceholder}
                    removeButtonAriaLabel={"Remove"}
                    pickerSuggestionsProps={suggestionProps}
                />;
            case UserPickerDisplayOption.List:
                return <ListPeoplePicker
                    selectedItems={userPersonas}
                    onResolveSuggestions={onResolveSuggestions}
                    onChange={onChange}
                    itemLimit={props.itemLimit}
                    disabled={props.disabled}
                    inputProps={inputPropsRequired}
                    removeButtonAriaLabel={"Remove"}
                    pickerSuggestionsProps={suggestionProps}
                />;
            case UserPickerDisplayOption.Compact:
                return <CompactPeoplePicker
                    selectedItems={userPersonas}
                    onResolveSuggestions={onResolveSuggestions}
                    itemLimit={props.itemLimit}
                    onChange={onChange}
                    disabled={props.disabled}
                    inputProps={{
                        'aria-label': props.label
                    }}
                    removeButtonAriaLabel={"Remove"}
                    pickerSuggestionsProps={suggestionProps}
                />;
        }
    };

    return (
        <div className={styles.userPicker} aria-label={props.label}>
            {props.showLabel && <Label className={styles.label} title={props.label} required={props.required}>{props.label}</Label>}
            {props.tooltipText &&
                <TooltipHost content={props.tooltipText} calloutProps={{ gapSpace: 0 }}>
                    <Icon tabIndex={0} ariaLabel={props.tooltipText} className={styles.tooltipIcon} iconName="Info" />
                </TooltipHost>
            }
            {renderPicker()}
        </div>
    );
};

UserPicker.defaultProps = {
    display: UserPickerDisplayOption.List,
    itemLimit: 50,
    showLabel: true
};

export default withServices(UserPicker);