import React from "react";
import ReactDom from "react-dom";
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneToggle } from '@microsoft/sp-webpart-base';
import { EmployeeRotationApp } from "apps";
import { nameofFactory } from "common";

import './EmployeeRotationWebPart.module.scss';
import * as strings from 'EmployeeRotationWebPartStrings';



const nameofProp = nameofFactory<IWebPartProps>();

export interface IWebPartProps {
    showTitle: boolean;
}
export default class EmployeeRotationWebPart extends BaseClientSideWebPart<IWebPartProps> {
    public render(): void {
        const {
            title,
            context,
            properties: { showTitle }
        } = this;
        const element = React.createElement(
            EmployeeRotationApp,
            {
                title: title,
                showTitle: showTitle,
                spfxContext: context
            }
        );
        ReactDom.render(element, this.domElement);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');

    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPane.Heading
                    },
                    groups: [
                        {
                            groupName: strings.PropertyPane.DisplayOptionsGroupName,
                            groupFields: [
                                PropertyPaneToggle(nameofProp("showTitle"), {
                                    label: strings.PropertyPane.ShowTitleLabel
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
