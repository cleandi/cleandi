import {builder, memoize, none} from "../src";
import {C0, F0, F1, F2} from "./testUtils";

describe('Function provider', () => {

    it ('should return a value from function without args', () => {
        interface T {
            a: string;
        }

        const p = builder<T>()
            .bindFunction('a', F0, none)
            .build('a');

        expect(p.a).toBe('F0');
    });

    it ('returns the value of a function with one dependency', () => {
        interface T {
            a: boolean;
            b: string;
        }
        const p = builder<T>()
            .bindFunction('a', () => true, none)
            .bindFunction('b', F1, d => [d.a] as const)
            .build('a', 'b');

        expect(p.b).toBe('true-F1');
    });

    it ('returns the value of a function with two dependency', () => {
        interface T {
            a: boolean;
            b: string;
            c: any;
        }
        const p = builder<T>()
            .bindFunction('a', () => true, none)
            .bindFunction('b', F1, d => [d.a] as const)
            .bindFunction('c', F2, d => [d.a, 1234] as const)
            .build('a', 'b', 'c');

        expect(p.c).toBe('true-1234-F2');
    });

    it ('throws when a dependency is provided more than once', () => {
        interface T {
            a: boolean;
        }
        const t = () => {
            const p = builder<T>()
                .bindFunction('a', () => true, none)
                .bindFunction('a', () => true, none)
        }
        expect(t).toThrow('a already bound');
    });

    it ('calls the function dependency each time by default', () => {
        interface T {
            a: number;
        }
        let counter = 0;
        const count = () => counter++;
        const p = builder<T>()
            .bindFunction('a', count, none)
            .build('a');
        expect(p.a).toBe(0);
        expect(p.a).toBe(1);
        expect(p.a).toBe(2);
    });

    it ('calls the function dependency once if memoized', () => {
        interface T {
            a: number;
        }
        let counter = 0;
        const count = () => counter++;
        const p = builder<T>()
            .bindFunction('a', count, none, memoize)
            .build('a');
        expect(p.a).toBe(0);
        expect(p.a).toBe(0);
        expect(p.a).toBe(0);
    });

    it ('the dependency is not instantiated if it is not called', () => {
        interface T {
            a: number;
            b: void;
        }
        let aInstantiated = false;
        let bInstantiated = false;
        const fa = () => {
            aInstantiated = true;
            return 1234;
        }
        const fb = (a: number) => {
            bInstantiated = true;
        }
        const p = builder<T>()
            .bindFunction('a', fa, none)
            .bindFunction('b', fb, d => [d.a] as const)
            .build('a', 'b');

        expect(aInstantiated).toBeFalsy();
        expect(bInstantiated).toBeFalsy();
    });

});