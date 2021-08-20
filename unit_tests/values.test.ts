import {builder} from "../src";

describe('Value provider', () => {

    it ('returns value provided', () => {
        interface T {
            a: number;
        }

        const p = builder<T>()
            .bindValue('a', 1)
            .build('a');

        expect(p.a).toBe(1);
    });

    it ('returns value provided', () => {
        interface T {
            a: () => number;
        }

        const p = builder<T>()
            .bindValue('a', () => 1)
            .build('a');

        expect(p.a()).toBe(1);
    });

    it ('throws when a dependency is bound more than once', () => {
        interface T {
            a: number;
        }
        const t = () => {
            const p = builder<T>()
                .bindValue('a',1)
                .bindValue('a',1)
                .build('a');
        }
        expect(t).toThrow('a already bound');
    });

});