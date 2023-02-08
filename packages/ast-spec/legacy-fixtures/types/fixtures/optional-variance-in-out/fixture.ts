// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type Processor<in out T> = (x: T) => T;
