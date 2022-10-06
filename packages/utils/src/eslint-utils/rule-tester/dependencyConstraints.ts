import * as semver from 'semver';

interface SemverVersionConstraint {
  readonly type: 'semver';
  readonly range: string;
  readonly options?: Parameters<typeof semver.satisfies>[2];
}
interface AtLeastVersionConstraint {
  readonly type: 'at-least';
  readonly version:
    | `${number}`
    | `${number}.${number}`
    | `${number}.${number}.${number}`
    | `${number}.${number}.${number}-${string}`;
}
type VersionConstraint = SemverVersionConstraint | AtLeastVersionConstraint;
interface DependencyConstraint {
  /**
   * Passing a string for the value is shorthand for the 'at-least' constraint
   */
  readonly [packageName: string]:
    | VersionConstraint
    | AtLeastVersionConstraint['version'];
}

const BASE_SATISFIES_OPTIONS: semver.RangeOptions = {
  includePrerelease: true,
};

function satisfiesDependencyConstraint(
  packageName: string,
  constraintIn: DependencyConstraint[string],
): boolean {
  const constraint: VersionConstraint =
    typeof constraintIn === 'string'
      ? {
          type: 'at-least',
          version: constraintIn,
        }
      : constraintIn;

  const satisfiesArguments: [string, SemverVersionConstraint['options']] =
    constraint.type === 'at-least'
      ? [`>=${constraint.version}`, BASE_SATISFIES_OPTIONS]
      : [
          constraint.range,
          typeof constraint.options === 'object'
            ? { ...BASE_SATISFIES_OPTIONS, ...constraint.options }
            : constraint.options,
        ];

  return semver.satisfies(
    (require(`${packageName}/package.json`) as { version: string }).version,
    ...satisfiesArguments,
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
