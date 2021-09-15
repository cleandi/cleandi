import {
    AsyncFunctionOptions, ClassOptions,
    Class,
    DependencyConstructor,
    FunctionOptions,
    Function,
    PartialDependencyConstructor, DependencyMiddleware
} from "./types";
import {StringSet} from "./polyfills";
import {
    PartialClassDependencyConstructor,
    DependencyConstructorUtils,
    ValueDependencyConstructor,
    AsyncValueDependencyConstructor,
    PartialFunctionDependencyConstructor,
    PartialAsyncFunctionDependencyConstructor,
    BoxedValueDependencyConstructor
} from "./dependencyConstructors";

export class DependencyBuilderImplementation {

    boundNames = new StringSet();
    constructors: {[keys: string]: DependencyConstructor} = {};
    onRequestMiddleware: {[keys: string]: DependencyMiddleware[]} = {};

    constructor(readonly inAsyncMode: boolean) {
    }

    bindValue(name: string, value: any) {

        this.throwIfNameIsBad(name);
        this.throwIfNameAlreadyBound(name);

        this.constructors[name] = new ValueDependencyConstructor(name, value);
        this.boundNames.add(name);

        return this;
    }

    bindAsyncValue(name: string, value: Promise<any>) {

        this.throwIfNotInAsyncMode();
        this.throwIfNameIsBad(name);
        this.throwIfNameAlreadyBound(name);

        this.constructors[name] = new AsyncValueDependencyConstructor(name, value);
        this.boundNames.add(name);

        return this;
    }

    bindFunction() {

        const args = this.getFunctionArgsOrThrow(arguments) as BindFunctionArgs;
        this.throwIfNameAlreadyBound(args.name);

        const memoize = args.options.memoize || false;

        this.constructors[args.name] = new PartialFunctionDependencyConstructor(args.name, args.fn, args.args, memoize);
        this.boundNames.add(args.name);

        return this;
    }

    bindAsyncFunction() {

        this.throwIfNotInAsyncMode();
        const args = this.getFunctionArgsOrThrow(arguments) as BindAsyncFunctionArgs;
        this.throwIfNameAlreadyBound(args.name);

        const memoize = args.options.memoize || false;
        const timeout = args.options.timeout || undefined;

        this.constructors[args.name] = new PartialAsyncFunctionDependencyConstructor(args.name, args.fn, args.args, memoize, timeout);
        this.boundNames.add(args.name);

        return this;
    }

    bindClass() {

        const args = this.getClassArgsOrThrow(arguments) as BindClassArgs;
        this.throwIfNameAlreadyBound(args.name);

        const singleton = args.options.singleton || false;

        this.constructors[args.name] = new PartialClassDependencyConstructor(args.name, args.cls, args.args, singleton);
        this.boundNames.add(args.name);

        return this;
    }

    onRequest(item: string, handler: (item: any) => any) {

        const di: DependencyMiddleware = {
            name: item,
            handler: handler
        };

        this.onRequestMiddleware[item]
            ? this.onRequestMiddleware[item].push(di)
            : this.onRequestMiddleware[item] = [di];

        return this;
    }

    build(key: string, ...keys: string[]) {

        const allKeys = this.getKeysOrThrow(key, keys);
        this.throwIfDuplicated(allKeys);
        this.throwIfMissingBindings(allKeys);
        this.throwIfUnknownMappers();

        this.resolvePartialConstructorsOrThrow();

        return this.buildDependencyProvider();
    }

    private resolvePartialConstructorsOrThrow() {

        const resolveConstructor = (ctor: PartialDependencyConstructor, chain: string[]) => {

            if (chain.some(e => e === ctor.name)) throw `Cyclic dependency ${[...chain, ctor.name].join(' -> ')}`;

            const argsForCtor = ctor.getArgs(this.constructors)
                .map(a => DependencyConstructorUtils.isAnyConstructorInstance(a) ? a : new BoxedValueDependencyConstructor(a))
                .map(a => DependencyConstructorUtils.isPartialInstance(a) ? resolveConstructor(a, [...chain, ctor.name]) : a);

            //if (DependencyConstructorUtils.areArgsResolved(argsForCtor))
            const resolvedCtor = ctor.toDependencyConstructor(argsForCtor);
            this.constructors[ctor.name] = resolvedCtor;
            return resolvedCtor;
        };

        Object.keys(this.constructors).forEach(key => {
            const ctor = this.constructors[key];
            if (DependencyConstructorUtils.isPartialInstance(ctor))
                resolveConstructor(ctor, []);
        });
    }

    private buildDependencyProvider() {

        const dependencyBox = {};

        const createGetter = this.inAsyncMode
            ? (key: string) => this.createAsyncDependencyGetter(key)
            : (key: string) => this.createSyncDependencyGetter(key);

        Object.keys(this.constructors).forEach(key => {
            Object.defineProperty(dependencyBox, key, {
                get: createGetter(key),
                enumerable: true
            });
        });

        // for debugging purposes
        Object.defineProperty(dependencyBox, '!constructors', {
            value: this.constructors,
            enumerable: false
        });

        return dependencyBox;
    }

    private createSyncDependencyGetter(key: string) {
        if (this.onRequestMiddleware[key]) {
            const len = this.onRequestMiddleware[key].length;
            const map = this.onRequestMiddleware[key].map(i => i.handler);
            return () => {
                let item = this.constructors[key].get();
                for (let j = 0; j < len; j++) {
                    item = map[j](item);
                }
                return item;
            }
        }
        return () => this.constructors[key].get();
    }

    private createAsyncDependencyGetter(key: string) {
        if (this.onRequestMiddleware[key]) {
            const len = this.onRequestMiddleware[key].length;
            const map = this.onRequestMiddleware[key].map(i => i.handler);
            return async () => {
                let item = await this.constructors[key].getAsync();
                for (let j = 0; j < len; j++) {
                    item = map[j](item);
                }
                return item;
            }
        }
        return () => this.constructors[key].getAsync();
    }

    private getKeysOrThrow(key: string, keys: string[]) {
        if (key == null)
            throw 'arguments must be provided when calling build';
        return [key, ...keys];
    }

    private throwIfDuplicated(keys: string[]) {
        const cache: { [key: string]: boolean; } = {};
        keys.forEach(name => {
            if (cache[name]) throw `${name} argument already provided`;
            cache[name] = true;
        });
    }

    private throwIfMissingBindings(keys: string[]) {
        const missingBindings: string[] = [];
        keys.forEach(name => {
            if (!this.boundNames.has(name)) missingBindings.push(name);
        });

        if (missingBindings.length === 1) throw `${missingBindings[0]} binding is not defined`;
        if (missingBindings.length > 1) throw `${missingBindings.join(', ')} bindings are not defined.`;
    }

    private throwIfUnknownMappers() {
        Object.keys(this.onRequestMiddleware).forEach(name => {
            if (!this.boundNames.has(name)) throw `${name} mapper is unknown`;
        });
    }

    private throwIfNameAlreadyBound(name: string) {
        if (this.boundNames.has(name)) throw `${name} already bound`;
    }

    private throwIfNotInAsyncMode() {
        if (!this.inAsyncMode) throw 'you need to use async mode';
    }

    private throwIfNameIsBad(name: string) {
        if (typeof name !== 'string') throw 'name must be a string';
    }

    private getFunctionArgsOrThrow(args: IArguments) {

        this.throwIfNameIsBad(args[0]);

        return {
            name: args[0],
            fn: args[1],
            args: typeof args[2] === 'function' ? args[2] : () => [],
            options: (typeof args[2] === 'object' && args[2]) || (typeof args[3] === 'object' && args[3]) || {}
        }
    }

    private getClassArgsOrThrow(args: IArguments) {

        this.throwIfNameIsBad(args[0]);

        return {
            name: args[0],
            cls: args[1],
            args: typeof args[2] === 'function' ? args[2] : () => [],
            options: (typeof args[2] === 'object' && args[2]) || (typeof args[3] === 'object' && args[3]) || {}
        }
    }
}

type BindFunctionArgs = {
    name: string;
    fn: Function<any>;
    args: (names: any) => any[];
    options: FunctionOptions
}

type BindAsyncFunctionArgs = {
    name: string;
    fn: Function<Promise<any>>;
    args: (names: any) => any[];
    options: AsyncFunctionOptions
}

type BindClassArgs = {
    name: string;
    cls: Class<any>;
    args: (names: any) => any[];
    options: ClassOptions
}