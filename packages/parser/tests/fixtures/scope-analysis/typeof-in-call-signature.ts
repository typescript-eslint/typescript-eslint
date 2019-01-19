const obj = { value: 1 }
interface A {
    <T extends typeof obj>(a: typeof obj, b: T): typeof obj
    new <T extends typeof obj>(a: typeof obj, b: T): typeof obj
}
