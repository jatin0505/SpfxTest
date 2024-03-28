import { IService, ServiceConstructor } from "./IService";

export interface IServiceDescriptor<S extends symbol, I extends IService, P extends Record<S, I>> {
    symbol: S;
    dependencies: symbol[];
    online: ServiceConstructor<I>;
    classic?: ServiceConstructor<I>;
    local?: ServiceConstructor<I>;
    test?: ServiceConstructor<I>;
}