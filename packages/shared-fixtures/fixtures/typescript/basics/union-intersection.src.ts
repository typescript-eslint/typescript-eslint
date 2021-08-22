let union: number | null | undefined;
let intersection: number & string;
let precedence1: number | string & boolean;
let precedence2: number & string | boolean;

type unionLeading = | number | string;
type intersectionLeading = | number & string;
type unionLeadingSingle = | number;
type intersectionLeadingSingle = & number;
