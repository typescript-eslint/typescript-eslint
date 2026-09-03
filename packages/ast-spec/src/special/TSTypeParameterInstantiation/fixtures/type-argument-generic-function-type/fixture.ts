type X = ReturnType<<T>(x: T) => number>;
// prettier-ignore
type Y = ReturnType <<T>(x: T) => number>;
type Z = ReturnType/* c */ <<T>(x: T) => number>;
