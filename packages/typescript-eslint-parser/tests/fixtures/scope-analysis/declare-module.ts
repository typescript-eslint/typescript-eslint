const a = 1
declare module "foo" {
    export const a: number
    export const b: typeof a
}
a
