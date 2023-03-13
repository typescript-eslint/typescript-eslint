// TODO: This fixture might be too large, and if so should be split up.

type EnthusiasticGreeting<T extends string> =
  `${Uppercase<T>} - ${Lowercase<T>} - ${Capitalize<T>} - ${Uncapitalize<T>}`;
type HELLO = EnthusiasticGreeting<'heLLo'>;
