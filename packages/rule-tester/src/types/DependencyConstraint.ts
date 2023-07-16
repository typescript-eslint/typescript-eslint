import type { RangeOptions } from 'semver';

export interface SemverVersionConstraint {
  readonly range: string;
  readonly options?: RangeOptions | boolean;
}
export type AtLeastVersionConstraint =
  | `${number}.${number}.${number}-${string}`
  | `${number}.${number}.${number}`
  | `${number}.${number}`
  | `${number}`;
export type VersionConstraint =
  | AtLeastVersionConstraint
  | SemverVersionConstraint;
export interface DependencyConstraint {
  /**
   * Passing a string for the value is shorthand for a '>=' constraint
   */
  readonly [packageName: string]: VersionConstraint;
}
