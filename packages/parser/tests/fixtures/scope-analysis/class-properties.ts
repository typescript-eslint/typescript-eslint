const s = Symbol()
class A {
    a: typeof s
    [s]: number
}
