type A = number
var a: { b: A }
class C {
    f(a: { b: A }): { b: A } {
        return {b: 1}
    }
}
