import * as semver from 'semver';

interface SemverVersionConstraint {
  readonly range: string;
  readonly options?: Parameters<typeof semver.satisfies>[2];
}
type AtLeastVersionConstraint =
  | `${number}`
  | `${number}.${number}`
  | `${number}.${number}.${number}`
  | `${number}.${number}.${number}-${string}`;
type VersionConstraint = SemverVersionConstraint | AtLeastVersionConstraint;
interface DependencyConstraint {
  /**
   * Passing a string for the value is shorthand for the 'at-least' constraint
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

function satisfiesAllDependencyConstraints(
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

export { satisfiesAllDependencyConstraints };
export type { DependencyConstraint };
