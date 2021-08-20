export class C0 {
    constructor() {
    }

    chain() {
        return 'C0';
    }
}

export class C1 {
    constructor(private readonly c0: C0) {
    }

    chain() {
        return [this.c0.chain(), 'C1'].join('-');
    }
}

export class C2 {
    constructor(private readonly c0: C0, private readonly p1: number) {
    }

    chain() {
        return [this.c0.chain(), this.p1, 'C2'].join('-');
    }
}

export class C3 {
    constructor(private readonly c0: C0, private readonly p1: number, private readonly p2: string) {
    }

    chain() {
        return [this.c0.chain(), this.p1, this.p2, 'C3'].join('-');
    }
}

export class C1or2 {
    constructor(private readonly p1: number, private readonly p2?: string) {
    }

    chain() {
        return [this.p1, this.p2, 'C1or2'].join('-');
    }
}

export function F0() {
    return 'F0';
}

export function F1(p1: boolean) {
    return [p1, 'F1'].join('-');
}

export function F2(p1: boolean, p2: number) {
    return [p1, p2, 'F2'].join('-');
}

export function F1or2(p1: boolean, p2?: number) {
    return [p1, p2, 'F1or2'].join('-');
}

export function asPromise<T>(x: T) {
    return new Promise<T>((resolve, reject) => {
        setImmediate(() => resolve(x));
    });
}