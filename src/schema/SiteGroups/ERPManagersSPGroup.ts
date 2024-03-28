import { ISiteGroup } from "common/sharepoint";
import { Defaults } from "../Defaults";

export interface IERPManagersSPGroup extends ISiteGroup {
}

export const ERPManagersSPGroup: IERPManagersSPGroup = {
    name: Defaults.ERPManagersGroup
};