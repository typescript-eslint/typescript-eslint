import type { CompilerOptions } from 'typescript';

export type StrictCompilerOption =
  | 'noImplicitAny'
  | 'noImplicitThis'
  | 'strictNullChecks'
  | 'strictFunctionTypes'
  | 'strictPropertyInitialization'
  | 'alwaysStrict'
  | 'strictBindCallApply';

export function isStrictCompilerOptionEnabled(
  options: CompilerOptions,
  option: StrictCompilerOption,
): boolean {
  return (
    (options.strict ? options[option] !== false : options[option] === true) &&
    (option !== 'strictPropertyInitialization' ||
      isStrictCompilerOptionEnabled(options, 'strictNullChecks'))
  );
}
