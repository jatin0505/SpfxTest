import moment from "moment";
import { sp, EmailProperties } from "@pnp/sp";
import { IAsyncData, AsyncDataCache, User } from "common";
import {
    ServiceContext, DeveloperService, DeveloperServiceProp, SharePointService, ISharePointService,
    SharePointServiceProp, IDeveloperService, TimeZoneServiceProp, TimeZoneService, ITimeZoneService,
    IDirectoryService, DirectoryService, DirectoryServiceProp
} from "common/services";
import { EmployeeRotation, FocusArea, FocusAreaAssignment, Store } from "model";
import { IConfigurationService, ConfigurationService, ConfigurationServiceProp } from '../configuration';
import { IEmployeeRotationService } from "./EmployeeRotationServiceDescriptor";
import { EmployeeRotationLoader } from "./EmployeeRotationLoader";
import { FocusAreaAssignmentLoader } from "./FocusAreaAssignmentLoader";
import { FocusAreaLoader, StoreLoader } from "./FocusAreaAndStoreLoader";
import { Defaults } from "schema/Defaults";
import { EmailConfiguration } from "model/EmailConfig";


export class OnlineEmployeeRotationService implements IEmployeeRotationService {
    private readonly _dev: IDeveloperService;
    private readonly _timezones: ITimeZoneService;
    private readonly _repo: ISharePointService;
    private readonly _configurations: IConfigurationService;
    private readonly _directory: IDirectoryService;

    private _employeeRotationsAsync: AsyncDataCache<EmployeeRotation[]>;
    private _focusAreaAssignmentAsync: AsyncDataCache<FocusAreaAssignment[]>;
    private _employeeRotationsLoader: EmployeeRotationLoader;
    private _focusAreaAssigmentLoader: FocusAreaAssignmentLoader;
    private _focusAreaLoader: FocusAreaLoader;
    private _storeLoader: StoreLoader;
    private _isHQTeam: boolean;
    private _isSendEmail: boolean;
    //private _isEnvProd: boolean;

    constructor({
        [DeveloperService]: dev,
        [TimeZoneService]: timezones,
        [SharePointService]: repo,
        [ConfigurationService]: configurations,
        [DirectoryService]: directory }: ServiceContext<DeveloperServiceProp & TimeZoneServiceProp
            & SharePointServiceProp & ConfigurationServiceProp & DirectoryServiceProp>) {
        this._dev = dev;
        this._timezones = timezones;
        this._repo = repo;
        this._configurations = configurations;
        this._directory = directory;

        this._employeeRotationsAsync = new AsyncDataCache<EmployeeRotation[]>(this._loadEmployeeRotations);
        this._focusAreaAssignmentAsync = new AsyncDataCache<FocusAreaAssignment[]>(this._loadFocusAreaAssignment);
    }

    public async initialize() {
        const configuration = this._configurations.active;
        if (!configuration.isNew) {
            const schema = configuration.schema;
            this._focusAreaLoader = new FocusAreaLoader(schema, this._repo);
            this._storeLoader = new StoreLoader(schema, this._repo);

            this._employeeRotationsLoader = new EmployeeRotationLoader(schema, this._repo, this._storeLoader);
            this._focusAreaAssigmentLoader = new FocusAreaAssignmentLoader(schema, this._repo, this._employeeRotationsLoader, this._focusAreaLoader, this._storeLoader);
            this._isHQTeam = await this._isCurrentUserHQ();
            this._isSendEmail = configuration.isSendEmail;
            //this._isEnvProd = configuration.isEnvProd;
        }

        this._dev.registerScripts(this._devScripts);
    }

    public get employeeRotationsAsync(): IAsyncData<EmployeeRotation[]> {
        return this._employeeRotationsAsync.get();
    }

    public get focusAreaAssignmentAsync(): IAsyncData<FocusAreaAssignment[]> {
        return this._focusAreaAssignmentAsync.get();
    }

    public get fetchFocusAreas(): Promise<FocusArea[]> {
        return this._focusAreaLoader.all();
    }

    public get fetchStores(): Promise<Store[]> {
        return this._storeLoader.all();
    }


    public get isHQUser(): boolean {
        return this._isHQTeam;
    }

    private readonly _loadEmployeeRotations = () =>
        Promise.all([
            this._focusAreaLoader.ensureLoaded(),
            this._storeLoader.ensureLoaded(),
            this._focusAreaAssigmentLoader.ensureLoaded(),
            this._employeeRotationsLoader.ensureLoaded(),
        ]).then(this._employeeRotationsLoader.all)


    private readonly _loadFocusAreaAssignment = () =>
        Promise.all([
            this._focusAreaLoader.ensureLoaded(),
            this._storeLoader.ensureLoaded(),
            this._employeeRotationsLoader.ensureLoaded(),
            this._focusAreaAssigmentLoader.ensureLoaded(),
        ]).then(this._focusAreaAssigmentLoader.all)


    public track(employeeRotation: EmployeeRotation): void;
    public track(focusAreaAssignment: FocusAreaAssignment): void;
    public track(entity: EmployeeRotation | FocusAreaAssignment): void {
        if (entity instanceof EmployeeRotation) {
            this._employeeRotationsLoader.track(entity);
        }
        if (entity instanceof FocusAreaAssignment) {
            this._focusAreaAssigmentLoader.track(entity);
        }
    }

    public async persistEmployeeRotation(): Promise<void> {
        const async = this._employeeRotationsAsync.get();
        async.savingStarted();

        try {
            await this._loadEmployeeRotations();
            await this._employeeRotationsLoader.persist();
            async.saveSuccessful();
        } catch (error) {
            async.saving = false;
            throw error;
        }
    }

    public async persistFocusAreaAssignment(): Promise<void> {
        const async = this._focusAreaAssignmentAsync.get();
        async.savingStarted();

        try {
            await this._loadFocusAreaAssignment();
            await this._focusAreaAssigmentLoader.persist();
            async.saveSuccessful();
        } catch (error) {
            async.saving = false;
            throw error;
        }
    }

    private async _isCurrentUserHQ(): Promise<boolean> {
        const erpOwnerSPGroup = await this._directory.siteOwnersGroup();
        return erpOwnerSPGroup.members.filter(user => user.email == this._directory.currentUser.email).length > 0 ? true : false;
    }

    private async _searchedUser(searchQuery: string): Promise<User[]> {
        return await this._directory.search(searchQuery);
    }



    public get currentUser(): User {
        return this._directory.currentUser;
    }

    public async getHQUsers(): Promise<User[]> {
        const erpOwnerSPGroup = await this._directory.siteOwnersGroup();
        return erpOwnerSPGroup.members;
        //return this._searchedUser("MRSHQVisitor@microsoft.com");
    }

    public async getCurrentUserStoreNumber(): Promise<string> {
        return await sp.profiles.getUserProfilePropertyFor(this._directory.currentUser.login, "RetailStoreNumber");
    }

    public async triggerMailToApprover(focusArea: FocusAreaAssignment) {
        try {
            if (this._isSendEmail)
                return sp.utility.sendEmail(focusArea.emailConfiguration._constructEmail(focusArea));
        }
        catch (ex) {
            throw ex;
        }
    }

    public async configureEmployeeRotationItemPermissions(item: EmployeeRotation) {
        console.log("Inside configureEmployeeRotationItemPermissions");

        let contributorRoleDefinitionId = await this._contributorRoleDefinitionId();
        const listItem = sp.web.lists.getByTitle(Defaults.EmployeeRotationListTitle).items.getById(item.id);
        await listItem.resetRoleInheritance();
        await listItem.breakRoleInheritance(true, false);

        const managerPrincipalId = (await sp.web.siteGroups.getByName(Defaults.ERPManagersGroup).get()).Id;


        listItem.roleAssignments.add(item.author.id, contributorRoleDefinitionId);

        await listItem.roleAssignments.remove(managerPrincipalId, await this._readRoleDefinitionId());

        console.log("Completed configureEmployeeRotationItemPermissions");
    }

    public async configureFocusAreaAssignmentItemPermissions(item: FocusAreaAssignment) {
        console.log("Inside configureFocusAreaAssignmentItemPermissions");

        let contributorRoleDefinitionId = await this._contributorRoleDefinitionId();
        const listItem = sp.web.lists.getByTitle(Defaults.FocusAreaAssignmentListTitle).items.getById(item.id);
        await listItem.resetRoleInheritance();
        await listItem.breakRoleInheritance(true, false);

        const managerPrincipalId = (await sp.web.siteGroups.getByName(Defaults.ERPManagersGroup).get()).Id;

        await listItem.roleAssignments.add(item.author.id, contributorRoleDefinitionId);

        await listItem.roleAssignments.remove(managerPrincipalId, await this._readRoleDefinitionId());

        console.log("Completed configureFocusAreaAssignmentItemPermissions");
    }

    public async configureFocusAreaAssignmentItemPermissionsOnRejection(item: FocusAreaAssignment) {
        console.log("Inside configureFocusAreaAssignmentItemPermissionsOnRejection");

        let contributorRoleDefinitionId = await this._contributorRoleDefinitionId();
        const listItem = sp.web.lists.getByTitle(Defaults.FocusAreaAssignmentListTitle).items.getById(item.id);

        const HubManagerPrincipalId = (await sp.web.siteUsers.getByEmail("MRS" + item.store.storeNumber + "HM@microsoft.com").get()).Id;
        const FocusAreaManagerPrincipalId = (await sp.web.siteUsers.getByEmail("MRS" + item.store.storeNumber + "FAM@microsoft.com").get()).Id;

        await listItem.roleAssignments.remove(HubManagerPrincipalId, contributorRoleDefinitionId);

        await listItem.roleAssignments.remove(FocusAreaManagerPrincipalId, await this._readRoleDefinitionId());

        console.log("Completed configureFocusAreaAssignmentItemPermissionsOnRejection");
    }

    private _contributorRoleDefinitionId(): Promise<number> {
        return sp.web.roleDefinitions.getByType(3 /*Contributor*/).get().then(definition => definition.Id);
    }

    private _readRoleDefinitionId(): Promise<number> {
        return sp.web.roleDefinitions.getByName("Read").get().then(definition => definition.Id);
    }

    //During deployment need to change the site page URL from EmployeeRotationProgram to Rotation-Program
    private readonly _devScripts = {
    };
}