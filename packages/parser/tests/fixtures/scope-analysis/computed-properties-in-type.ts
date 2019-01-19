const s1 = Symbol(), s2 = Symbol()
type A = {
    [s1]: number
    [s2](s1: number, s2: number): number;
}
