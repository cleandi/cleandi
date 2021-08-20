import {DependencyBuilderImplementation} from "./builderImplementation";
import {AsyncDependencyBuilder, ConstructorOptions, DependencyBuilder, FunctionOptions} from "./types";

export function builder<T extends object = never>(): T extends never ? never : DependencyBuilder<T> {
    return new DependencyBuilderImplementation(false) as any;
}

export function asyncBuilder<T extends object = never>(): T extends never ? never : AsyncDependencyBuilder<T> {
    return new DependencyBuilderImplementation(true) as any;
}

export function none() {
    return [] as const;
}

export const singleton = {
    singleton: true
} as ConstructorOptions;

export const memoize = {
    memoize: true
} as FunctionOptions;