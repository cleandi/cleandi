import {builder} from "../src";

describe('noseque', () => {

    // it('tal', () => {
    //     type basic = {
    //         a: number,
    //         b: boolean,
    //     };
    //     const p = di<basic>()
    //         .bindValue("a", 1)
    //         .bindValue("b", true)
    //         .build('a', 'b');
    //
    //     expect(p.a).toBe(1)
    //     expect(p.b).toBe(true)
    // });

    // it('cual', () => {
    //
    //     class C {
    //         constructor(readonly num: number, readonly bol: boolean) {}
    //         do() {
    //             console.log(`${this.num} ${this.bol}`);
    //         }
    //     }
    //
    //     type basic = {
    //         a: number,
    //         b: boolean,
    //         c: C
    //     };
    //
    //     const p = di<basic>()
    //         .bindConstructor('c', C, d => [1, true] as const )
    //         .bindValue("a", 1)
    //         .bindValue("b", true)
    //         .build('a', 'b', 'c');
    //
    //     p.c.do();
    //
    //
    // });

    it('cual', () => {

        class A {
            constructor(readonly claseb: B, readonly num: number) {}
            val() {
                return `${this.num}-a-${this.claseb.val()}`;
            }
        }

        class B {
            constructor(readonly clasec: C) {}
            val() {
                return `b-${this.clasec.val()}`;
            }
        }

        class C {
            val() {
                return 'c';
            }
        }

        type basic = {
            a: A,
            b: B,
            c: C,
            num: number
        };

        const p = builder<basic>()
            .bindConstructor('a', A, d => [d.b, d.num] as const)
            .bindConstructor('c', C, d => [] as const)
            .bindConstructor('b', B, d => [d.c] as const)
            .bindValue('num', 1)
            .onRequest('a', item => item)
            .build('a', 'b', 'c', 'num');

        const val = p.a.val();

        expect(val).toBe('1-a-b-c');
    });

});