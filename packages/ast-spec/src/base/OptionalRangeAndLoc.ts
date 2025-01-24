import type { Range } from './Range';
import type { SourceLocation } from './SourceLocation';

// TODO - breaking change move this into `typescript-estree`
export type OptionalRangeAndLoc<T> = {
  loc?: SourceLocation;
  range?: Range;
} & Pick<T, Exclude<keyof T, 'loc' | 'range'>>;
