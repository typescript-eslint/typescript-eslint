// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

type EnthusiasticGreeting<T extends string> =
  `${Uppercase<T>} - ${Lowercase<T>} - ${Capitalize<T>} - ${Uncapitalize<T>}`;
type HELLO = EnthusiasticGreeting<'heLLo'>;
