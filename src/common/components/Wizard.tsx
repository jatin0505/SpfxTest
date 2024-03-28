import React from "react";
import _ from "lodash";
import * as cstrings from "CommonStrings";
import { css, DefaultButton, PrimaryButton, Icon, MessageBar, MessageBarType, Spinner, SpinnerSize } from "office-ui-fabric-react";
import { IButtonStrings } from "../Localization";
import { StatefulComponent } from "./StatefulComponent";

import styles from "./styles/Wizard.module.scss";

export type WizardData = {
};

export interface IWizardPageProps<D extends WizardData> {
    data: D;
    onClickEdit?: (pageIndex: number) => void;
    children?: React.ReactNode;
}

export interface IWizardStepProps<D extends WizardData> extends IWizardPageProps<D> {
    stepNumber?: number;
    totalStepCount?: number;
    validateFn: (fn: () => boolean) => void;
    deactivateFn: (fn: () => Promise<any>) => void;
}

export type PageRenderer<D extends WizardData, P extends IWizardPageProps<D> = IWizardPageProps<D>> = React.FC<P>;
export type StepRenderer<D extends WizardData, P extends IWizardStepProps<D> = IWizardStepProps<D>> = PageRenderer<D, P>;

export interface IWizardStrings {
    startButton?: IButtonStrings;
    backButton?: IButtonStrings;
    nextButton?: IButtonStrings;
    finishButton?: IButtonStrings;
    cancelButton?: IButtonStrings;
}

export interface IWizardProps<D extends WizardData> {
    data: D;
    headingLabel?: string;
    renderHeading?: () => React.ReactNode;
    className?: string;
    footerClassName?: string;
    panel?: boolean;
    strings?: IWizardStrings;
    readonlyWizrad?: boolean;
    startPage?: PageRenderer<D>;
    stepPages: StepRenderer<D>[];
    successPage?: PageRenderer<D>;
    successPageTimeout?: number;
    execute?: (config: D) => Promise<void>;
    initialize?: () => Promise<void>;
    onWizardComplete?: () => void;
    onDiscard?: () => void;
}

export interface IWizardState {
    currentPageIndex: number;
    error: any;
}

abstract class WizardPage<D extends WizardData, P extends IWizardPageProps<D> = IWizardPageProps<D>> {
    constructor(
        protected readonly page: PageRenderer<D, P>,
        protected readonly wizardStrings: IWizardStrings
    ) {
    }

    public async activate(): Promise<void> {
    }

    public valid(): boolean {
        return true;
    }

    public async deactivate(): Promise<void> {
    }

    public get autoContinue(): boolean {
        return false;
    }

    public renderPage(props: P): React.ReactNode {
        const Page = this.page;
        return <Page {...props} />;
    }

    public renderFooterButtons(disabled: boolean, readonlyWizrad?: boolean): React.ReactNode[] {
        return [];
    }
}

class WizardStartPage<D extends WizardData> extends WizardPage<D> {
    constructor(
        step: PageRenderer<D>,
        wizardStrings: IWizardStrings,
        private readonly _onClickStart: () => void
    ) {
        super(step, wizardStrings);
    }

    public renderFooterButtons(disabled: boolean, readonlyWizrad?: boolean): React.ReactNode[] {
        return [
            <PrimaryButton text={this.wizardStrings.startButton.Text} disabled={disabled} onClick={this._onClickStart} />
        ];
    }
}

class WizardStepPage<D extends WizardData> extends WizardPage<D, IWizardStepProps<D>> {
    private _validateFn: () => boolean;
    private _deactivateFn: () => Promise<any>;

    constructor(
        step: PageRenderer<D>,
        wizardStrings: IWizardStrings,
        private readonly _stepNumber: number,
        private readonly _totalStepCount: number,
        private readonly _onClickBack: () => void,
        private readonly _onClickNext: () => void,
        private readonly _onClickCancel?: () => void
    ) {
        super(step, wizardStrings);
    }

    public valid(): boolean {
        return this._validateFn ? this._validateFn() : true;
    }

    public async deactivate(): Promise<void> {
        if (this._deactivateFn)
            await this._deactivateFn();
    }

    protected get isStep(): boolean {
        return !!this._stepNumber;
    }

    protected get isFirstStep(): boolean {
        return this._stepNumber === 1;
    }

    protected get isLastStep(): boolean {
        return this._stepNumber === this._totalStepCount;
    }

    public renderPage(props: IWizardStepProps<D>): React.ReactNode {
        if (this.isStep) {
            props.stepNumber = this._stepNumber;
            props.totalStepCount = this._totalStepCount;
        }

        const Page = this.page;
        return <Page {...props} validateFn={fn => this._validateFn = fn} deactivateFn={fn => this._deactivateFn = fn} />;
    }

    public renderFooterButtons(disabled: boolean, readonlyWizrad: boolean): React.ReactNode[] {
        const backButtonText = this.wizardStrings.backButton.Text;
        const cancelButtonText = this.wizardStrings.cancelButton.Text;
        const nextButtonText = this.isLastStep ? this.wizardStrings.finishButton.Text : this.wizardStrings.nextButton.Text;
        const renderNextButton = this.isLastStep ? (readonlyWizrad ? false : true) : true;
        return renderNextButton ? [
            <DefaultButton text={backButtonText} disabled={this.isFirstStep || disabled} onClick={this._onClickBack} />,
            <PrimaryButton text={nextButtonText} disabled={disabled} onClick={this._onClickNext} />,
            <DefaultButton text={cancelButtonText} onClick={this._onClickCancel} />
        ] :
            [
                <DefaultButton text={backButtonText} disabled={this.isFirstStep || disabled} onClick={this._onClickBack} />,
                <DefaultButton text={cancelButtonText} onClick={this._onClickCancel} />
            ];
    }
}

class WizardInitializePage<D extends WizardData> extends WizardPage<D> {
    constructor(
        wizardStrings: IWizardStrings,
        private readonly _initialize: () => Promise<void>
    ) {
        super(null, wizardStrings);
    }

    public async activate() {
        await this._initialize();
    }

    public get autoContinue(): boolean {
        return true;
    }

    public renderPage(props: IWizardPageProps<D>): React.ReactNode {
        return <Spinner size={SpinnerSize.large} label={cstrings.OneMoment} />;
    }
}

class WizardExecutePage<D extends WizardData> extends WizardPage<D> {
    constructor(
        wizardStrings: IWizardStrings,
        private readonly _execute: () => Promise<void>
    ) {
        super(null, wizardStrings);
    }

    public async activate() {
        await this._execute();
    }

    public get autoContinue(): boolean {
        return true;
    }

    public renderPage(props: IWizardPageProps<D>): React.ReactNode {
        return <Spinner style={{ marginTop: 20 }} size={SpinnerSize.large} label={cstrings.OneMoment} />;
    }
}

class WizardSuccessPage<D extends WizardData> extends WizardPage<D> {
    constructor(
        step: PageRenderer<D>,
        wizardStrings: IWizardStrings,
        private readonly _timeout: number,
        private readonly _onWizardComplete: () => void
    ) {
        super(step, wizardStrings);
    }

    public async activate() {
        setTimeout(this._onWizardComplete, this._timeout);
    }
}

export class Wizard<D extends WizardData> extends StatefulComponent<IWizardProps<D>, IWizardState> {
    private static defaultStrings: IWizardStrings = {
        startButton: cstrings.Wizard.StartButton,
        backButton: cstrings.Wizard.BackButton,
        nextButton: cstrings.Wizard.NextButton,
        finishButton: cstrings.Wizard.FinishButton,
        cancelButton: cstrings.Wizard.CancelButton
    };

    private static defaultProps: Partial<IWizardProps<any>> = {
        strings: Wizard.defaultStrings,
        successPageTimeout: 2500,
        onWizardComplete: _.noop
    };

    private readonly _pages: WizardPage<D>[];

    constructor(props: IWizardProps<D>) {
        super(props);

        const wizardStrings = { ...Wizard.defaultStrings, ...props.strings };
        this._pages = this._buildPages(props, wizardStrings);

        this.state = {
            currentPageIndex: -1,
            error: null
        };
    }

    public componentDidMount() {
        this._nextPage();
    }

    private readonly _goToPage = async (pageIndex: number) => {
        const currentPageIndex = this.state.currentPageIndex;
        const currentPage = this._pages[currentPageIndex];
        const isValid = currentPage ? currentPage.valid() : true;

        if (isValid && pageIndex < this._pages.length) {
            if (currentPage) {
                await currentPage.deactivate();
            }

            const newPage = this._pages[pageIndex];

            this.setState({
                currentPageIndex: pageIndex
            });

            try {
                await newPage.activate();
            } catch (e) {
                console.error(e);
                this.setState({ error: e });
            }
        }
    }

    private readonly _buildPages = (props: IWizardProps<D>, wizardStrings: IWizardStrings): WizardPage<D>[] => {
        const pages: WizardPage<D>[] = [];

        if (props.startPage) {
            const page = new WizardStartPage(props.startPage, wizardStrings, this._nextPage);
            pages.push(page);
        }

        if (props.initialize) {
            const page = new WizardInitializePage<D>(wizardStrings, props.initialize);
            pages.push(page);
        }

        props.stepPages.forEach((step, index, steps) => {
            const page = new WizardStepPage(step, wizardStrings, index + 1, steps.length, this._previousPage, this._nextPage, this.props.onDiscard);
            pages.push(page);
        });

        if (props.execute) {
            const page = new WizardExecutePage<D>(wizardStrings, () => { return props.execute(props.data); });
            pages.push(page);
        }

        if (props.successPage) {
            const page = new WizardSuccessPage(props.successPage, wizardStrings, props.successPageTimeout, props.onWizardComplete);
            pages.push(page);
        }

        return pages;
    }

    private readonly _previousPage = () => {
        const currentPageIndex = this.state.currentPageIndex;
        const newPageIndex = currentPageIndex - 1;
        const currentPage = this._pages[currentPageIndex];
        const isValid = currentPage ? currentPage.valid() : true;

        if (isValid) {
            if (newPageIndex >= 0) {
                this._pages[currentPageIndex].deactivate();
                this._pages[newPageIndex].activate();

                this.setState({
                    currentPageIndex: newPageIndex
                });
            }
        }
    }

    private readonly _nextPage = async () => {
        const currentPageIndex = this.state.currentPageIndex;
        const newPageIndex = currentPageIndex + 1;
        const isLastPage = currentPageIndex == this._pages.length - 1;
        const currentPage = this._pages[currentPageIndex];
        const isValid = currentPage ? currentPage.valid() : true;

        if (isValid) {
            if (currentPage) {
                await currentPage.deactivate();
            }

            if (isLastPage) {
                this.props.onWizardComplete();
            } else {
                const newPage = this._pages[newPageIndex];

                this.setState({
                    currentPageIndex: newPageIndex
                });

                try {
                    await newPage.activate();
                } catch (e) {
                    console.error(e);
                    this.setState({ error: e });
                }

                if (newPage.autoContinue) {
                    this._nextPage();
                }
            }
        }
    }

    private readonly _renderProgressBar = (currentPageIndex: number) => {
        const background = this.props.panel ? '' : styles.background;
        if (this._pages[currentPageIndex] instanceof WizardStartPage)
            return;

        return (
            <div className={background}>
                <div className={styles.progressBar}>
                    {this._pages.map((page, idx) => {
                        const iconName = idx < currentPageIndex ? 'CompletedSolid' : (idx == currentPageIndex ? 'RadioBtnOn' : 'CircleRing');
                        const className = css(styles.statusIndicator, { [styles.futurePage]: idx > currentPageIndex });

                        if (page instanceof WizardStepPage) {
                            return <Icon className={className} iconName={iconName} />;
                        }
                    })}
                </div>
            </div>
        );
    }

    public render(): React.ReactElement<IWizardProps<D>> {
        const currentPage = this._pages[this.state.currentPageIndex];
        const pageProps: IWizardPageProps<D> = {
            data: this.props.data,
            onClickEdit: this._goToPage
        };

        return (
            <div className={css(styles.wizard, this.props.className)}>
                <div className="ms-textAlignCenter">
                    {!this.props.panel &&
                        <div className={this.state.currentPageIndex != 0 ? styles.header : styles.headerNoStyle}>
                            {(this.props.renderHeading && this.props.renderHeading()) || (this.props.headingLabel && <h1>{this.props.headingLabel}</h1>)}
                        </div>
                    }
                    {(this.props.panel && this.state.currentPageIndex == 0) &&
                        <div className={styles.headerNoStyle}>
                            {(this.props.renderHeading && this.props.renderHeading()) || (this.props.headingLabel && <h1>{this.props.headingLabel}</h1>)}
                        </div>
                    }
                    {this._renderProgressBar(this.state.currentPageIndex)}
                </div>

                {!this.state.error
                    ? currentPage && currentPage.renderPage(pageProps)
                    : <MessageBar messageBarType={MessageBarType.error} role="alert">{cstrings.GenericError}</MessageBar>
                }

                <div className={css(styles.footer, this.props.footerClassName)}>
                    {currentPage && currentPage.renderFooterButtons(!!this.state.error, this.props.readonlyWizrad)}
                </div>
            </div>
        );
    }
}