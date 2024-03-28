import { SpfxContext } from "./SpfxContext";

export type ServicesProp<S = {}> = {
    services: S;
};

export interface IService {
    initialize(): Promise<void>;
}

export type ServiceContext<S = {}> = { spfxContext: SpfxContext } & S;

export interface ServiceConstructor<I extends IService> {
    new(context: ServiceContext): I;
}