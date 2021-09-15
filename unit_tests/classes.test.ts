import {builder, singleton} from "../src";
import {C0, C1, C2, C3} from "./testUtils";

describe('Class provider', () => {

    it ('builds and returns a class with 0 dependencies', () => {
        interface T {
            a: C0;
        }

        const p = builder<T>()
            .bindClass('a', C0)
            .build('a');

        expect(p.a.chain()).toBe('C0');
    });

    it ('throws when a dependency is not bound', () => {
        interface T {
            a: C0;
        }
        const t = () => {
            const p = builder<T>()
                .build('a');
        }
        expect(t).toThrow('a binding is not defined');
    });

    it ('throws when a dependency is bound more than once', () => {
        interface T {
            a: C0;
        }
        const t = () => {
            const p = builder<T>()
                .bindClass('a', C0)
                .bindClass('a', C0)
                .build('a');
        }
        expect(t).toThrow('a already bound');
    });

    it ('throws when a dependency is provided more than once on the build phase', () => {
        interface T {
            a: C0;
        }
        const t = () => {
            const p = builder<T>()
                .bindClass('a', C0)
                .build('a', 'a');
        }
        expect(t).toThrow('a argument already provided');
    });

    it ('builds and returns a class with 1 dependency', () => {
        interface T {
            a: C0;
            b: C1;
        }

        const p = builder<T>()
            .bindClass('a', C0)
            .bindClass('b', C1, d => [d.a] as const)
            .build('a', 'b');

        expect(p.b.chain()).toBe('C0-C1');
    });

    it ('builds and returns a class with 2 dependency', () => {
        interface T {
            a: C0;
            b: C1;
            c: C2;
        }

        const p = builder<T>()
            .bindClass('a', C0)
            .bindClass('b', C1, d => [d.a] as const)
            .bindClass('c', C2, d => [d.a, 555] as const)
            .build('a', 'b', 'c');

        expect(p.c.chain()).toBe('C0-555-C2');
    });

    it ('builds and returns a class with 3 dependency', () => {
        interface T {
            a: C0;
            b: number;
            c: string;
            d: C3;
        }

        const p = builder<T>()
            .bindClass('a', C0)
            .bindValue('b', 555)
            .bindValue('c', 'hello')
            .bindClass('d', C3, d => [d.a, d.b, d.c] as const)
            .build('a', 'b', 'c', 'd');

        expect(p.d.chain()).toBe('C0-555-hello-C3');
    });

    it ('calls the constructor dependency each time by default', () => {
        let constructed = 0;
        class C {
            private counter = 0;
            constructor() {
                constructed++;
            }
            count() {
                return this.counter++;
            }
        }
        interface T {
            a: C;
        }
        const p = builder<T>()
            .bindClass('a', C)
            .build('a');
        expect(p.a.count()).toBe(0);
        expect(p.a.count()).toBe(0);
        expect(p.a.count()).toBe(0);
        expect(constructed).toBe(3);
    });

    it ('calls the constructor dependency only once if singleton', () => {
        let constructed = 0;
        class C {
            private counter = 0;
            constructor() {
                constructed++;
            }
            count() {
                return this.counter++;
            }
        }
        interface T {
            a: C;
        }
        const p = builder<T>()
            .bindClass('a', C, singleton)
            .build('a');
        expect(p.a.count()).toBe(0);
        expect(p.a.count()).toBe(1);
        expect(p.a.count()).toBe(2);
        expect(constructed).toBe(1);
    });

    it ('the dependency is not instantiated if it is not called', () => {
        let aInstantiated = false;
        let binstantiated = false;
        class A {
            constructor() {
                aInstantiated = true;
            }
        }
        class B {
            constructor(private a: A) {
                binstantiated = true;
            }
        }
        interface T {
            a: A;
            b: B;
        }
        const p = builder<T>()
            .bindClass('a', A)
            .bindClass('b', B, d => [d.a] as const)
            .build('a', 'b');

        expect(aInstantiated).toBeFalsy();
        expect(binstantiated).toBeFalsy();
    });
});