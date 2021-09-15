import {Class, DependencyConstructor, PartialDependencyConstructor} from "./types";
import {PromiseUtils} from "./polyfills";


const GetPartialThrowMessage = 'A partial constructor can not provide a value';

export class DependencyConstructorUtils {

    private constructor() {}

    static isPartialInstance(v: any ): v is PartialDependencyConstructor {
        return v instanceof PartialClassDependencyConstructor ||
            v instanceof PartialFunctionDependencyConstructor ||
            v instanceof PartialAsyncFunctionDependencyConstructor;
    }

    static isAnyConstructorInstance(v: any): v is DependencyConstructor {
        return v instanceof PartialClassDependencyConstructor ||
            v instanceof PartialFunctionDependencyConstructor ||
            v instanceof PartialAsyncFunctionDependencyConstructor ||
            v instanceof ClassDependencyConstructor ||
            v instanceof FunctionDependencyConstructor ||
            v instanceof ValueDependencyConstructor ||
            v instanceof BoxedValueDependencyConstructor ||
            v instanceof AsyncValueDependencyConstructor ||
            v instanceof AsyncFunctionDependencyConstructor;
    }

    static areArgsResolved(args: any[]) {
        return args.every(a => !DependencyConstructorUtils.isPartialInstance(a));
    }

    // static boxNonConstructors(args: any[]): DepedencyConstructor[] {
    //     return args.map(a => DependencyConstructorUtils.isAnyConstructorInstance(a) ? a : new BoxedValueDependencyConstructor(a))
    // }
}


export class PartialClassDependencyConstructor implements PartialDependencyConstructor {

    constructor(
        readonly name: string,
        readonly cls: Class<any>,
        readonly argsBuilder: (args: any) => DependencyConstructor[],
        readonly singleton?: boolean
    ) {
    }

    get(): any {
        throw GetPartialThrowMessage;
    }

    getAsync(): Promise<any> {
        throw GetPartialThrowMessage;
    }

    getArgs(args: any): DependencyConstructor[] {
        return this.argsBuilder(args);
    }

    toDependencyConstructor(args: DependencyConstructor[]): DependencyConstructor {
        return new ClassDependencyConstructor(this.name, this.cls, args, this.singleton);
    }
}

export class PartialFunctionDependencyConstructor implements PartialDependencyConstructor {

    constructor(
        readonly name: string,
        readonly fn: Function,
        readonly argsBuilder: (args: any) => DependencyConstructor[],
        readonly memoize?: boolean
    ) {
    }

    get(): any {
        throw GetPartialThrowMessage;
    }

    getAsync(): Promise<any> {
        throw GetPartialThrowMessage;
    }

    getArgs(args: any): DependencyConstructor[] {
        return this.argsBuilder(args);
    }

    toDependencyConstructor(args: DependencyConstructor[]): DependencyConstructor {
        return new FunctionDependencyConstructor(this.name, this.fn, args, this.memoize);
    }
}

export class PartialAsyncFunctionDependencyConstructor implements PartialDependencyConstructor {

    constructor(
        readonly name: string,
        readonly fn: Function,
        readonly argsBuilder: (args: any) => DependencyConstructor[],
        readonly memoize?: boolean,
        readonly timeout?: number
    ) {
    }

    get(): any {
        throw GetPartialThrowMessage;
    }

    getAsync(): Promise<any> {
        throw GetPartialThrowMessage;
    }

    getArgs(args: any): DependencyConstructor[] {
        return this.argsBuilder(args);
    }

    toDependencyConstructor(args: DependencyConstructor[]): DependencyConstructor {
        return new AsyncFunctionDependencyConstructor(this.name, this.fn, args, this.memoize, this.timeout);
    }
}



export class ClassDependencyConstructor implements DependencyConstructor {

    singletonInstance: any = undefined;

    constructor(
        readonly name: string,
        readonly cls: Class<any>,
        readonly args: DependencyConstructor[],
        readonly singleton?: boolean
    ) {
    }

    newInstance() {
        const resolvedArgs = this.args.map(a => a.get());
        return new (Function.prototype.bind.apply(this.cls, [null, ...resolvedArgs]));
    }

    getSingletonInstance() {
        if (this.singletonInstance === undefined) {
            this.singletonInstance = this.newInstance();
        }
        return this.singletonInstance;
    }

    get(): any {
        return this.singleton ? this.getSingletonInstance() : this.newInstance();
    }

    async newInstanceAsync() {
        const resolvedArgs = await Promise.all(this.args.map(a => a.getAsync()))
        return new (Function.prototype.bind.apply(this.cls, [null, ...resolvedArgs]));
    }

    async getSingletonInstanceAsync() {
        if (this.singletonInstance === undefined) {
            this.singletonInstance = await this.newInstanceAsync();
        }
        return this.singletonInstance;
    }

    getAsync() {
        return this.singleton? this.getSingletonInstanceAsync() : this.newInstanceAsync();
    }
}


export class FunctionDependencyConstructor implements DependencyConstructor {

    memoizedValue: any = undefined;

    constructor(
        readonly name: string,
        readonly fn: Function,
        readonly args: DependencyConstructor[],
        readonly memoize?: boolean
    ) {}

    callFunction() {
        const resolvedArgs = this.args.map(a => a.get());
        return this.fn.apply(null, resolvedArgs);
    }

    getMemoizedValue() {
        if (this.memoizedValue === undefined) {
            this.memoizedValue = this.callFunction();
        }
        return this.memoizedValue;
    }

    get(): any {
        return this.memoize ? this.getMemoizedValue() : this.callFunction();
    }

    async callFunctionAsync() {
        const resolvedArgs = await Promise.all(this.args.map(a => a.getAsync()));
        return this.fn.apply(null, resolvedArgs);
    }

    async getMemoizedValueAsync() {
        if (this.memoizedValue === undefined) {
            this.memoizedValue = await this.callFunctionAsync();
        }
        return this.memoizedValue;
    }

    getAsync() {
        return this.memoize? this.getMemoizedValueAsync() : this.callFunctionAsync();
    }
}

export class ValueDependencyConstructor implements DependencyConstructor {

    constructor(
        readonly name: string,
        readonly val: any,
        readonly copy?: boolean
    ) {
    }

    getValue() {
        return this.val;
    }

    getCopyOfValue() {
        throw 'not implemented';
    }

    get() {
        return this.copy ? this.getCopyOfValue() : this.getValue();
    }

    getValueAsync() {
        return Promise.resolve(this.val);
    }

    getCopyOfValueAsync(): Promise<any> {
        throw 'not implemented';
    }

    getAsync() {
        return this.copy ? this.getCopyOfValueAsync() : this.getValueAsync();
    }
}

export class BoxedValueDependencyConstructor implements DependencyConstructor {

    private static counter = 0;

    readonly name: string;

    constructor(
        readonly val: any,
    ) {
        this.name = `boxed${BoxedValueDependencyConstructor.counter++}`;
    }

    get() {
        return this.val;
    }

    getAsync() {
        return Promise.resolve(this.val);
    }
}


export class AsyncValueDependencyConstructor implements DependencyConstructor {

    constructor(
        readonly name: string,
        readonly val: Promise<any>,
        readonly timeout?: number
    ) {
    }

    get() {
        throw `For an async value you must call getAsync()`;
    }

    getAsync() {
        return this.timeout ? PromiseUtils.timeout(this.val, this.timeout) : this.val;
    }
}


export class AsyncFunctionDependencyConstructor implements DependencyConstructor {

    memoizedValue: any = undefined;

    constructor(
        readonly name: string,
        readonly fn: Function,
        readonly args: DependencyConstructor[],
        readonly memoize?: boolean,
        readonly timeout?: number
    ) {}

    get(): any {
        throw `For an async value you must call getAsync()`;
    }

    async callFunctionAsync() {
        const args = this.timeout
            ? this.args.map(a => PromiseUtils.timeout(a.getAsync(), this.timeout as number))
            : this.args.map(a => a.getAsync());
        const resolvedArgs = await Promise.all(args);
        return this.fn.apply(null, resolvedArgs);
    }

    async getMemoizedValueAsync() {
        if (this.memoizedValue === undefined) {
            this.memoizedValue = await this.callFunctionAsync();
        }
        return this.memoizedValue;
    }

    getAsync() {
        return this.memoize? this.getMemoizedValueAsync() : this.callFunctionAsync();
    }

    hasAsyncDependency() {
        return true;
    }
}