import {DependencyBuilderImplementation} from "./builderImplementation";
import {AsyncDependencyBuilder, ClassOptions, DependencyBuilder, FunctionOptions} from "./types";

export function builder<T>(): DependencyBuilder<T> {
    return new DependencyBuilderImplementation(false) as any;
}

export function asyncBuilder<T>(): AsyncDependencyBuilder<T> {
    return new DependencyBuilderImplementation(true) as any;
}

export const singleton = {
    singleton: true
} as ClassOptions;

export const memoize = {
    memoize: true
} as FunctionOptions;