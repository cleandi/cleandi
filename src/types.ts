//export type FunctionWithReturn = (...args: any) => any;

export type FunctionOptions = {
    memoize?: boolean;
};

export type AsyncFunctionOptions = FunctionOptions & {
  timeout?: number;
};

export type ConstructorOptions = {
    singleton?: boolean;
}

export type FunctionWithReturnType<T> = (...args: any) => T;

export type NoArgsFunctionWithReturnType<T> = () => T;

export type Constructor =
    new(...args: any[]) => any;

type ConstructorWithReturnType<T> =
    new(...args: any[]) => T;

type NoArgsConstructorWithReturnType<T> =
    new() => T;

type MissingKeys<T, Keys extends string> =
    {[KT in keyof T]: KT extends Keys ? never : KT}[keyof T];

type HasMissingKeys<T, Keys extends string> =
    MissingKeys<T, Keys> extends never ? false : true;

type DependencyProviderMethods = {
    //dispose(): void;
    //onCreate(args: (name: keyof T, item: T[k]))
    //onRequest
}

// type FunctionThatReturns<F extends FunctionWithReturn, R> =
//     ReturnType<F> extends R ? true : false;

type DependencyProvider<T> =
    T & DependencyProviderMethods;

type AsyncDependencyProvider<T> =
    {[K in keyof T]: Promise<T[K]>} & DependencyProviderMethods;

export type DependencyBuilder<T> = {

    bindValue<K extends keyof T, V extends T[K]>(item: K, value: V): DependencyBuilder<T>;

    bindFunction<K extends keyof T, V extends NoArgsFunctionWithReturnType<T[K]>>(item: K, fn: V, options?: FunctionOptions): DependencyBuilder<T>;
    bindFunction<K extends keyof T, V extends FunctionWithReturnType<T[K]>>(item: K, fn: V, args: (items: T) => Readonly<Parameters<V>>, options?: FunctionOptions): DependencyBuilder<T>;

    bindConstructor<K extends keyof T, V extends ConstructorWithReturnType<T[K]>>(item: K, ctor: V, args: (items: T) => Readonly<ConstructorParameters<V>>, options?: ConstructorOptions): DependencyBuilder<T>;
    bindConstructor<K extends keyof T, V extends NoArgsConstructorWithReturnType<T[K]>>(item: K, ctor: V, options?: ConstructorOptions): DependencyBuilder<T>;

    onRequest<K extends keyof T>(item: K, handler: (item: T[K]) => T[K]): DependencyBuilder<T>;

    build<C extends string & keyof T>(key: C, ...keys: C[]): HasMissingKeys<T, C> extends true ? void : DependencyProvider<T>;
}

export type AsyncDependencyBuilder<T> = {

    bindValue<K extends keyof T, V extends T[K]>(item: K, value: V): AsyncDependencyBuilder<T>;

    bindAsyncValue<K extends keyof T, V extends Promise<T[K]>>(item: K, value: V): AsyncDependencyBuilder<T>;

    bindFunction<K extends keyof T, V extends FunctionWithReturnType<T[K]>>(item: K, fn: V, args: (items: T) => Readonly<Parameters<V>>, options?: FunctionOptions): AsyncDependencyBuilder<T>;
    bindFunction<K extends keyof T, V extends NoArgsFunctionWithReturnType<T[K]>>(item: K, fn: V, options?: FunctionOptions): AsyncDependencyBuilder<T>;

    bindAsyncFunction<K extends keyof T, V extends FunctionWithReturnType<Promise<T[K]>>>(item: K, fn: V, args: (items: T) => Readonly<Parameters<V>>, options?: FunctionOptions): AsyncDependencyBuilder<T>;
    bindAsyncFunction<K extends keyof T, V extends NoArgsFunctionWithReturnType<Promise<T[K]>>>(item: K, fn: V, options?: FunctionOptions): AsyncDependencyBuilder<T>;

    bindConstructor<K extends keyof T, V extends ConstructorWithReturnType<T[K]>>(item: K, ctor: V, args: (items: T) => Readonly<ConstructorParameters<V>>, options?: ConstructorOptions): AsyncDependencyBuilder<T>;
    bindConstructor<K extends keyof T, V extends NoArgsConstructorWithReturnType<T[K]>>(item: K, ctor: V, options?: ConstructorOptions): AsyncDependencyBuilder<T>;

    onRequest<K extends keyof T>(item: K, handler: (item: T[K]) => T[K]): AsyncDependencyBuilder<T>;

    build<C extends string & keyof T>(key: C, ...keys: C[]): HasMissingKeys<T, C> extends true ? void : AsyncDependencyProvider<T>;
}

export interface DepedencyConstructor {

    readonly name: string;

    get(): any;

    getAsync(): Promise<any>;
}

export interface PartialDependencyConstructor extends DepedencyConstructor {

    getArgs(args: any): DepedencyConstructor[];

    toDependencyConstructor(args: DepedencyConstructor[]): DepedencyConstructor;
}

export interface DependencyMiddleware {

    readonly name: string;

    handler: (item: any) => any;
}