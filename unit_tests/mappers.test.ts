import {asyncBuilder, builder} from "../src";

describe('Mappers', () => {

    it ('should not be valid out of known dependencies', () => {
        interface T {
            a: number;
        }

        const t = () => {
            const p = builder<T>()
                .bindValue('a', 1)
                .onRequest('b' as 'a', item => item)
                .build('a');
        }

        expect(t).toThrow('b mapper is unknown');
    });

    it ('should map the dependency', () => {
        interface T {
            a: number;
        }

        const p = builder<T>()
            .bindValue('a', 1)
            .onRequest('a', item => item + 1)
            .onRequest('a', item => item * 3)
            .build('a');

        expect(p.a).toBe(6);
    });

    it ('should map the dependency and respect the map order for several mappers', () => {
        interface T {
            a: number;
        }

        const p = builder<T>()
            .bindValue('a', 1)
            .onRequest('a', item => item * 3)
            .onRequest('a', item => item + 1)
            .build('a');

        expect(p.a).toBe(4);
    });

    it ('should intercept and transform in async', async () => {
        interface T {
            a: number;
        }

        const p = asyncBuilder<T>()
            .bindValue('a', 1)
            .onRequest('a', item => item + 1)
            .onRequest('a', item => item * 3)
            .build('a');

        expect(await p.a).toBe(6);
    });

});