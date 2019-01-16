const s = Symbol()
class A {
    f(): void
    f(a: typeof s): void
    f(a?: any): void {
        // do something.
    }
}
