import type { RangeOptions } from 'semver';

export interface SemverVersionConstraint {
  readonly range: string;
  readonly options?: boolean | RangeOptions;
}
export type AtLeastVersionConstraint =
  | `${number}`
  | `${number}.${number}`
  | `${number}.${number}.${number}`
  | `${number}.${number}.${number}-${string}`;
export type VersionConstraint =
  | SemverVersionConstraint
  | AtLeastVersionConstraint;
export interface DependencyConstraint {
  /**
   * Passing a string for the value is shorthand for a '>=' constraint
   */
  readonly [packageName: string]: VersionConstraint;
}
