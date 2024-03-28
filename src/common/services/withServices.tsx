import React from "react";
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ServicesProp } from './IService';

const ServicesContext = React.createContext({});
export const ServicesProvider = ServicesContext.Provider;
export const ServicesConsumer = ServicesContext.Consumer;

type ComponentTypeWithoutServices<P> = {
    WithoutServices: React.ComponentType<P>;
};

export const withServices = <P extends ServicesProp<{}>>(
    Component: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof ServicesProp<{}>>> & ComponentTypeWithoutServices<P> => {
    class ComponentWithServices extends React.Component<P> {
        public static displayName = `withServices(${Component.displayName || Component.name})`;
        public static WithoutServices: React.ComponentType<P> = Component;

        public render() {
            return (
                <ServicesConsumer>
                    {services => <Component {...this.props} services={services} />}
                </ServicesConsumer>
            );
        }
    }

    return hoistNonReactStatics(ComponentWithServices, Component);
};