const s1 = Symbol(), s2 = Symbol()
interface A {
    [s1]: number
    [s2](s1: number, s2: number): number;
}
