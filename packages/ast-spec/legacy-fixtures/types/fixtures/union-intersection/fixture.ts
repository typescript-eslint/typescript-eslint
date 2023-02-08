// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

let union: number | null | undefined;
let intersection: number & string;
let precedence1: number | (string & boolean);
let precedence2: (number & string) | boolean;
