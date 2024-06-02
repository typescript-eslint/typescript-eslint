// `Options` and `RangeOptions` are defined in the 'semver' package.
// We redeclare them here to avoid a peer dependency on that package:
export interface RangeOptions {
  includePrerelease?: boolean | undefined;
  loose?: boolean | undefined;
}

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
/**
 * Passing a string for the value is shorthand for a '>=' constraint
 */
export type DependencyConstraint = Readonly<Record<string, VersionConstraint>>;
