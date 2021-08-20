import {asyncBuilder, builder, memoize, none, singleton} from "../src";
import {C0, C1, C2, C3, F0, F1} from "./testUtils";

describe('Async providers', () => {

    it ('builds and returns a class with 0 dependencies', async () => {
        interface T {
            a: C0;
        }

        const p = asyncBuilder<T>()
            .bindConstructor('a', C0, none)
            .build('a');

        expect((await p.a).chain()).toBe('C0');
    });

    it ('builds and returns a function with one dependency', async () => {
        interface T {
            a: string;
            b: boolean;
        }

        const p = asyncBuilder<T>()
            .bindFunction('a', F1, d => [d.b] as const)
            .bindValue('b', true)
            .build('a', 'b');

        expect(await p.a).toBe('true-F1');
    });

    it ('builds and returns a value', async () => {
        interface T {
            a: string;
        }

        const p = asyncBuilder<T>()
            .bindValue('a', 'abc')
            .build('a');

        expect(await p.a).toBe('abc');
    });

    it ('builds and returns an async function', async () => {
        interface T {
            a: string;
        }

        const asyncFunc = () => Promise.resolve('abc');
        const p = asyncBuilder<T>()
            .bindAsyncFunction('a', asyncFunc, none)
            .build('a');

        expect(await p.a).toBe('abc');
    });

    it ('builds and returns an async function', async () => {
        interface T {
            a: string;
        }

        const p = asyncBuilder<T>()
            .bindAsyncValue('a', Promise.resolve('abc'))
            .build('a');

        expect(await p.a).toBe('abc');
    });

    it ('throws when a dependency is not bound', async () => {
        interface T {
            a: number;
        }
        const t = () => {
            const p = asyncBuilder<T>()
                .build('a');
        }
        expect(t).toThrow('a binding is not defined');
    });

    it ('throws when a dependency value is bound more than once', () => {
        interface T {
            a: number;
        }
        const t = () => {
            const p = asyncBuilder<T>()
                .bindAsyncValue('a', Promise.resolve(1))
                .bindAsyncValue('a', Promise.resolve(1))
                .build('a');
        }
        expect(t).toThrow('a already bound');
    });

    it ('throws when a dependency async function is bound more than once', () => {
        interface T {
            a: number;
        }
        const asyncFunc = () => Promise.resolve(1234);
        const t = () => {
            const p = asyncBuilder<T>()
                .bindAsyncFunction('a', asyncFunc, none)
                .bindAsyncFunction('a', asyncFunc, none)
                .build('a');
        }
        expect(t).toThrow('a already bound');
    });

});