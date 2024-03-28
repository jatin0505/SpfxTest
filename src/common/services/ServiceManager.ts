import _ from 'lodash';
import { EnvironmentType, Environment, ServiceScope } from "@microsoft/sp-core-library";
import { ArrayType, UnionToIntersectionType } from "../Utils";
import { IService } from "./IService";
import { IServiceDescriptor } from "./IServiceDescriptor";
import { ServiceKeyBuilder } from "./ServiceKeyBuilder";
import { SpfxContext } from "./SpfxContext";

export type ServiceDescriptorArray<S extends symbol = symbol, I extends IService = IService, P extends Record<S, I> = Record<S, I>> = Array<IServiceDescriptor<S, I, P>>;
export type ServiceDescriptorToProp<D extends IServiceDescriptor<any, any, any>> = D extends IServiceDescriptor<infer S, infer I, infer P> ? S extends Symbol ? P : never : never;
export type ServicesType<D extends ServiceDescriptorArray> = UnionToIntersectionType<ServiceDescriptorToProp<ArrayType<D>>>;

export class ServiceManager<TServices> {
    public static async create<TDescriptorArray extends ServiceDescriptorArray>(appName: string, context: SpfxContext, descriptors: TDescriptorArray, environment?: EnvironmentType): Promise<ServiceManager<ServicesType<TDescriptorArray>>> {
        ServiceManager.throwIfAnyDependencyIsNotDescribed(descriptors);

        const manager = new ServiceManager<ServicesType<TDescriptorArray>>(descriptors);
        const serviceKeyBuilder = new ServiceKeyBuilder(appName, context, environment || Environment.type, manager.services);
        await ServiceManager.serviceScopeWhenFinishedAsync(context.serviceScope, scope => manager._init(scope, serviceKeyBuilder));
        return manager;
    }

    private static async serviceScopeWhenFinishedAsync(scope: ServiceScope, fn: (scope: ServiceScope) => Promise<void>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            scope.whenFinished(async () => {
                try {
                    await fn(scope);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }

    private static throwIfAnyDependencyIsNotDescribed(descriptors: ServiceDescriptorArray) {
        const describedServiceSymbols = descriptors.map(d => d.symbol);

        for (const descriptor of descriptors) {
            for (const dependency of descriptor.dependencies) {
                if (!_.includes(describedServiceSymbols, dependency)) {
                    throw `No descriptor found for dependency '${dependency.toString()}' of service '${descriptor.symbol.toString()}'`;
                }
            }
        }
    }

    public readonly services: TServices = {} as TServices;

    constructor(
        private readonly _descriptors: ServiceDescriptorArray
    ) {
    }

    private async _init(scope: ServiceScope, serviceKeyBuilder: ServiceKeyBuilder) {
        const dep = new Map<IServiceDescriptor<symbol, IService, Record<symbol, IService>>, symbol[]>();
        this._descriptors.forEach(descriptor => dep.set(descriptor, [...descriptor.dependencies]));

        const initGroups: ServiceDescriptorArray[] = [];

        while (dep.size > 0) {
            const initGroup: ServiceDescriptorArray = [];

            // push services with no dependencies to this initialization group
            dep.forEach((remainingDependencies, descriptor) => {
                if (remainingDependencies.length === 0)
                    initGroup.push(descriptor);
            });

            // remove services with no dependencies from the map
            initGroup.forEach(ig => dep.delete(ig));

            // remove dependencies on services that are in the current initialization group
            dep.forEach((dependencies, descriptor) => {
                const remainingDependencies = dependencies.filter(dependency => initGroup.every(ig => ig.symbol !== dependency));
                dep.set(descriptor, remainingDependencies);
            });

            initGroups.push(initGroup);
        }

        for (const initGroup of initGroups) {
            const serviceGroup: IService[] = [];

            for (const descriptor of initGroup) {
                const key = serviceKeyBuilder.build(descriptor);
                const service = scope.consume(key);
                serviceGroup.push(service);
                (this.services as any)[descriptor.symbol] = service;
            }

            await Promise.all(serviceGroup.map(s => s.initialize()));
        }
    }
}
