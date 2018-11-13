type A = number
interface B {
    prop1: A
}
interface C extends B {
    method(a: { b: A }): { c: A }
}

var a: C
