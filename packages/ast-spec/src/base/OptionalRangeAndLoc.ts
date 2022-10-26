import type { Range } from './Range';
import type { SourceLocation } from './SourceLocation';

// TODO - breaking change move this into `typescript-estree`
export type OptionalRangeAndLoc<T> = Pick<
  T,
  Exclude<keyof T, 'loc' | 'range'>
> & {
  range?: Range;
  loc?: SourceLocation;
};
