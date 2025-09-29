type T = 1; // should have 1 reference
type M = { [K in string as T]: 1 };
