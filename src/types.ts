export type FunctionOptions = {
    memoize?: boolean;
};

export type AsyncFunctionOptions = FunctionOptions & {
  timeout?: number;
};

export type ClassOptions = {
    singleton?: boolean;
}

export type Function<T> = (...args: any) => T;

export type NoArgsFunction<T> = () => T;

export type Class<T> =
    new(...args: any[]) => T;

export type NoArgsClass<T> =
    new() => T;

type MissingKeys<T, Keys extends string> =
    {[KT in keyof T]: KT extends Keys ? never : KT}[keyof T];

type HasMissingKeys<T, Keys extends string> =
    MissingKeys<T, Keys> extends never ? false : true;

type DependencyProvider<T> = T;

type AsyncDependencyProvider<T> =
    {[K in keyof T]: Promise<T[K]>};

export type DependencyBuilder<T> = {

    bindValue<K extends keyof T, V extends T[K]>(item: K, value: V): DependencyBuilder<T>;

    bindFunction<K extends keyof T, V extends NoArgsFunction<T[K]>>(item: K, fn: V, options?: FunctionOptions): DependencyBuilder<T>;
    bindFunction<K extends keyof T, V extends Function<T[K]>>(item: K, fn: V, args: (items: T) => Readonly<Parameters<V>>, options?: FunctionOptions): DependencyBuilder<T>;

    bindClass<K extends keyof T, V extends Class<T[K]>>(item: K, cls: V, args: (items: T) => Readonly<ConstructorParameters<V>>, options?: ClassOptions): DependencyBuilder<T>;
    bindClass<K extends keyof T, V extends NoArgsClass<T[K]>>(item: K, cls: V, options?: ClassOptions): DependencyBuilder<T>;

    onRequest<K extends keyof T>(item: K, handler: (item: T[K]) => T[K]): DependencyBuilder<T>;

    build<C extends string & keyof T>(key: C, ...keys: C[]): HasMissingKeys<T, C> extends true ? void : DependencyProvider<T>;
}

export type AsyncDependencyBuilder<T> = {

    bindValue<K extends keyof T, V extends T[K]>(item: K, value: V): AsyncDependencyBuilder<T>;

    bindAsyncValue<K extends keyof T, V extends Promise<T[K]>>(item: K, value: V): AsyncDependencyBuilder<T>;

    bindFunction<K extends keyof T, V extends Function<T[K]>>(item: K, fn: V, args: (items: T) => Readonly<Parameters<V>>, options?: FunctionOptions): AsyncDependencyBuilder<T>;
    bindFunction<K extends keyof T, V extends NoArgsFunction<T[K]>>(item: K, fn: V, options?: FunctionOptions): AsyncDependencyBuilder<T>;

    bindAsyncFunction<K extends keyof T, V extends Function<Promise<T[K]>>>(item: K, fn: V, args: (items: T) => Readonly<Parameters<V>>, options?: FunctionOptions): AsyncDependencyBuilder<T>;
    bindAsyncFunction<K extends keyof T, V extends NoArgsFunction<Promise<T[K]>>>(item: K, fn: V, options?: FunctionOptions): AsyncDependencyBuilder<T>;

    bindClass<K extends keyof T, V extends Class<T[K]>>(item: K, cls: V, args: (items: T) => Readonly<ConstructorParameters<V>>, options?: ClassOptions): AsyncDependencyBuilder<T>;
    bindClass<K extends keyof T, V extends NoArgsClass<T[K]>>(item: K, cls: V, options?: ClassOptions): AsyncDependencyBuilder<T>;

    onRequest<K extends keyof T>(item: K, handler: (item: T[K]) => T[K]): AsyncDependencyBuilder<T>;

    build<C extends string & keyof T>(key: C, ...keys: C[]): HasMissingKeys<T, C> extends true ? void : AsyncDependencyProvider<T>;
}

export interface DependencyConstructor {

    readonly name: string;

    get(): any;

    getAsync(): Promise<any>;
}

export interface PartialDependencyConstructor extends DependencyConstructor {

    getArgs(args: any): DependencyConstructor[];

    toDependencyConstructor(args: DependencyConstructor[]): DependencyConstructor;
}

export interface DependencyMiddleware {

    readonly name: string;

    handler: (item: any) => any;
}