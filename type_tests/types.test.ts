import {C0, C1, F0} from "../unit_tests/testUtils";
import {asyncBuilder, builder} from "../src";


describe('Types', () => {

    it ('a builder of something different than an object should not be allowed', () => {
        const p = builder<number>() // @ts-error
    });

    it ('an async builder of something different than an object should not be allowed', () => {
        const p = asyncBuilder<number>() // @ts-error
    });

    // it ('a builder without T should not be allowed', () => {
    //     const p = builder() // @ts-error
    // });

    // it ('an async builder without T should not be allowed', () => {
    //     const p = asyncBuilder() // @ts-error
    // });

    it ('an invalid list of constructors parameters should not be allowed', () => {
        interface T {
            a: C1;
        }
        const p = builder<T>().bindClass('a', C1, () => [] as const) // @ts-error
    });

    it ('an invalid list of constructors parameters should not be allowed for async builder', () => {
        interface T {
            a: C1;
        }
        const p = asyncBuilder<T>().bindClass('a', C1, () => [] as const) // @ts-error
    });

    it ('unknown constructor dependencies should not be allowed to bind', () => {
        interface T {
            a: C1;
        }
        const p = builder<T>()
            .bindClass('b', C1, () => [] as const) // @ts-error
    });

    it ('unknown constructor dependencies should not be allowed to bind on async builder', () => {
        interface T {
            a: C1;
        }
        const p = asyncBuilder<T>()
            .bindClass('b', C1, () => [] as const) // @ts-error
    });

    it ('unknown constructor dependencies should not be allowed to bind', () => {
        interface T {
            a: C0;
        }
        const p = builder<T>()
            .bindClass('b', C0, () => [] as const) // @ts-error
    });

    it ('unknown constructor dependencies should not be allowed to bind for async builder', () => {
        interface T {
            a: C0;
        }
        const p = asyncBuilder<T>()
            .bindClass('b', C0, () => [] as const) // @ts-error
    });

    it ('unknown function dependencies should not be allowed to bind', () => {
        interface T {
            a: string;
        }
        const p = builder<T>()
            .bindFunction('b', F0, () => [] as const) // @ts-error
    });

    it ('unknown function dependencies should not be allowed to bind for async builder', () => {
        interface T {
            a: string;
        }
        const p = asyncBuilder<T>()
            .bindFunction('b', F0, () => [] as const) // @ts-error
    });

    it ('unknown value dependencies should not be allowed to bind', () => {
        interface T {
            a: number;
        }
        const p = builder<T>()
            .bindValue('b', 1234) // @ts-error
    });

    it ('unknown value dependencies should not be allowed to bind for async builder', () => {
        interface T {
            a: number;
        }
        const p = asyncBuilder<T>()
            .bindValue('b', 1234) // @ts-error
    });

    it ('unknown value dependencies should not be allowed to bind', () => {
        interface T {
            a: number;
        }
        const p = builder<T>()
            .bindValue('b', 1234) // @ts-error
    });

    it ('unknown value dependencies should not be allowed to bind for async builder', () => {
        interface T {
            a: number;
        }
        const p = asyncBuilder<T>()
            .bindValue('b', 1234) // @ts-error
    });

    it ('an invalid list of constructors parameters should not be allowed', () => {
        interface T {
            a: C1;
        }
        const p = builder<T>().bindClass('a', C1, () => [] as const) // @ts-error
    });

    it ('an invalid list of constructors parameters should not be allowed for async builder', () => {
        interface T {
            a: C1;
        }
        const p = asyncBuilder<T>().bindClass('a', C1, () => [] as const) // @ts-error
    });

    it ('an invalid list of constructors parameters should not be allowed', () => {
        interface T {
            a: C1;
        }
        const p = builder<T>()
            .bindClass('a', C1, () => [new C0()] as const)
            .build() // @ts-error
    });

    it ('an invalid list of constructors parameters should not be allowed for async builder', () => {
        interface T {
            a: C1;
        }
        const p = asyncBuilder<T>()
            .bindClass('a', C1, () => [new C0()] as const)
            .build() // @ts-error
    });

    it ('building for unknown dependencies should not be allowed', () => {
        interface T {
            a: C1;
        }
        const p = builder<T>()
            .bindClass('a', C1, () => [new C0()] as const)
            .build('b') // @ts-error
    });

    it ('building for unknown dependencies should not be allowed for async builder', () => {
        interface T {
            a: C1;
        }
        const p = asyncBuilder<T>()
            .bindClass('a', C1, () => [new C0()] as const)
            .build('b') // @ts-error
    });

    it ('mapping unknown dependencies should be not allowed', () => {
        interface T {
            a: number;
        }

        const p = builder<T>()
            .bindValue('a', 1)
            .onRequest('b', item => item)  // @ts-error
            .build('a');
    });

    it ('mapping with a wrong return type should not be allowed', () => {
        interface T {
            a: number;
        }

        const p = builder<T>()
            .bindValue('a', 1)
            .onRequest('a', item => true)  // @ts-error
            .build('a');
    });

});