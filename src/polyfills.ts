export class PromiseUtils {

    static timeout(p: Promise<any>, ms: number) {
        return Promise.race([
            p,
            new Promise((resolve, reject) => setTimeout(() => reject(`Promise timed out after ${ms} ms`), ms))
        ]);
    }
}

export class StringSet {
    private cache: {[key:string]:boolean} = {};
    add(val: string): void {
        this.cache[val] = true;
    }
    has(val: string): boolean {
        return val in this.cache;
    }
    keys() : string[] {
        return Object.keys(this.cache);
    }
    delete(val: string) {
        delete this.cache[val];
    }
}
