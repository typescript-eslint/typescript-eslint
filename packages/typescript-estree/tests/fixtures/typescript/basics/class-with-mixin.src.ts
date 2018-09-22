function M<T extends Constructor<{}>>(Base: T) {
    return class extends Base { }
}

class X extends M<any>(C) implements I { }

class C { }
interface I { }
type Constructor<T> = new (...args: any[]) => T;
