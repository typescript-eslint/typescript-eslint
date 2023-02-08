// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type A = typeof import('A');
type B = import('B').X<Y>;
