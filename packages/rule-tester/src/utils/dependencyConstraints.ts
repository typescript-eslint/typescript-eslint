import * as semver from 'semver';

export interface SemverVersionConstraint {
  readonly range: string;
  readonly options?: Parameters<typeof semver.satisfies>[2];
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

const BASE_SATISFIES_OPTIONS: semver.RangeOptions = {
  includePrerelease: true,
};

function satisfiesDependencyConstraint(
  packageName: string,
  constraintIn: DependencyConstraint[string],
): boolean {
  const constraint: SemverVersionConstraint =
    typeof constraintIn === 'string'
      ? {
          range: `>=${constraintIn}`,
        }
      : constraintIn;

  return semver.satisfies(
    (require(`${packageName}/package.json`) as { version: string }).version,
    constraint.range,
    typeof constraint.options === 'object'
      ? { ...BASE_SATISFIES_OPTIONS, ...constraint.options }
      : constraint.options,
  );
}

export function satisfiesAllDependencyConstraints(
  dependencyConstraints: DependencyConstraint | undefined,
): boolean {
  if (dependencyConstraints == null) {
    return true;
  }

  for (const [packageName, constraint] of Object.entries(
    dependencyConstraints,
  )) {
    if (!satisfiesDependencyConstraint(packageName, constraint)) {
      return false;
    }
  }

  return true;
}
