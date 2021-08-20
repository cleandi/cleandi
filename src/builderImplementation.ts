import {
    AsyncFunctionOptions, ConstructorOptions,
    Constructor,
    DepedencyConstructor,
    FunctionOptions,
    FunctionWithReturnType,
    PartialDependencyConstructor
} from "./types";
import {StringSet} from "./polyfills";
import {
    PartialClassDependencyConstructor,
    DependencyConstructorUtils,
    ValueDependencyConstructor,
    AsyncValueDependencyConstructor,
    PartialFunctionDependencyConstructor,
    PartialAsyncFunctionDependencyConstructor, BoxedValueDependencyConstructor
} from "./dependencyConstructors";

export class DependencyBuilderImplementation {

    boundNames = new StringSet();
    constructors: {[keys: string]: DepedencyConstructor} = {};
    
    constructor(readonly inAsyncMode: boolean) {
    }

    bindValue(name: string, value: any) {

        this.throwIfNameAlreadyBound(name);

        this.constructors[name] = new ValueDependencyConstructor(name, value);
        this.boundNames.add(name);

        return this;
    }

    bindAsyncValue(name: string, value: Promise<any>) {

        this.throwIfNotInAsyncMode();
        this.throwIfNameAlreadyBound(name);

        this.constructors[name] = new AsyncValueDependencyConstructor(name, value);
        this.boundNames.add(name);

        return this;
    }

    bindFunction(name: string, fn: FunctionWithReturnType<any>, args: (names: any) => any[], options: FunctionOptions = {}) {

        this.throwIfNameAlreadyBound(name);

        const memoize = options && options.memoize || false;

        this.constructors[name] = new PartialFunctionDependencyConstructor(name, fn, args, memoize);
        this.boundNames.add(name);

        return this;
    }

    bindAsyncFunction(name: string, fn: FunctionWithReturnType<Promise<any>>, args: (names: any) => any[], options: AsyncFunctionOptions = {}) {

        this.throwIfNotInAsyncMode();
        this.throwIfNameAlreadyBound(name);

        const memoize = options && options.memoize || false;
        const timeout = options && options.timeout || undefined;

        this.constructors[name] = new PartialAsyncFunctionDependencyConstructor(name, fn, args, memoize, timeout);
        this.boundNames.add(name);

        return this;
    }

    bindConstructor(name: string, ctor: Constructor, args: (names: any) => any[], options: ConstructorOptions = {}) {

        this.throwIfNameAlreadyBound(name);

        const singleton = options && options.singleton || false;

        this.constructors[name] = new PartialClassDependencyConstructor(name, ctor, args, singleton);
        this.boundNames.add(name);

        return this;
    }

    build(key: string, ...keys: string[]) {

        const allKeys = this.getKeysOrThrow(key, keys);
        this.throwIfDuplicated(allKeys);
        this.throwIfMissingBindings(allKeys);

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
            ? (key: string) => () => this.constructors[key].getAsync()
            : (key: string) => () => this.constructors[key].get();

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

    private throwIfNameAlreadyBound(name: string) {
        if (this.boundNames.has(name)) throw `${name} already bound`;
    }

    private throwIfNotInAsyncMode() {
        if (!this.inAsyncMode) throw 'you need to use async mode';
    }
}