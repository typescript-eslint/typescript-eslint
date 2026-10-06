interface UnitTestsGroup {
  codecovName: string;
  name: string;
  os: 'ubuntu-latest' | 'windows-latest';
  projects: string[];
}

interface TestMatrices {
  isPluginAffected: boolean;
  projectServicePackages: string[];
  snapshotPackages: string[];
  unitTestsMatrix: UnitTestsGroup[];
}

// Packages that should also be tested with the project service enabled.
const PROJECT_SERVICE_PACKAGES = [
  'eslint-plugin-internal',
  'typescript-estree',
];

// Packages whose fixture snapshots are regenerated from scratch to check that they're clean.
const SNAPSHOT_CHECK_PACKAGES = ['ast-spec', 'scope-manager'];

// Packages that have their own tests CI job.
const EXCLUDED_PACKAGES = ['integration-tests'];

// Packages that have no (or we don't care about their) platform-specific,
// runtime behavior, so skipping them on Windows to have less jobs to run.
const WINDOWS_EXCLUDED_PACKAGES = [
  'ast-spec',
  'eslint-plugin-internal',
  'rule-schema-to-typescript-types',
  'scope-manager',
  'utils',
  'visitor-keys',
];

// Most packages' tests only take a few seconds, so running each in its own job is mostly setup time,
// and uses up the limited number of concurrently running jobs. Instead, they're grouped into jobs.
const LINUX_GROUPS = [
  ['typescript-estree'],
  [
    'project-service',
    'repo',
    'rule-schema-to-typescript-types',
    'tsconfig-utils',
    'type-utils',
    'typescript-eslint',
    'utils',
  ],
  [
    'ast-spec',
    'eslint-plugin-internal',
    'parser',
    'rule-tester',
    'scope-manager',
    'types',
    'visitor-keys',
  ],
];

const WINDOWS_GROUPS = [
  ['typescript-estree', 'rule-tester', 'types'],
  ['typescript-eslint', 'repo', 'project-service'],
  ['eslint-plugin', 'type-utils', 'parser', 'tsconfig-utils'],
];

const CODECOV_NAME_MAX_LENGTH = 100;

const toMatrix = (
  os: UnitTestsGroup['os'],
  groups: string[][],
  packages: string[],
): UnitTestsGroup[] =>
  groups
    .map(group => group.filter(pkg => packages.includes(pkg)))
    .filter(projects => projects.length > 0)
    .map(projects => ({
      codecovName: projects.join('-').slice(0, CODECOV_NAME_MAX_LENGTH),
      name: projects.join(', '),
      os,
      projects,
    }));

export function getTestMatrices(affected: string[]): TestMatrices {
  const unitTests = affected.filter(pkg => !EXCLUDED_PACKAGES.includes(pkg));

  // Fail instead of silently skipping the tests of packages that aren't in any group (e.g. new packages).
  const ungrouped = new Set([
    // `eslint-plugin` runs in its own sharded job on Linux.
    ...unitTests.filter(
      pkg => pkg !== 'eslint-plugin' && !LINUX_GROUPS.flat().includes(pkg),
    ),

    ...unitTests.filter(
      pkg =>
        !WINDOWS_EXCLUDED_PACKAGES.includes(pkg) &&
        !WINDOWS_GROUPS.flat().includes(pkg),
    ),
  ]);

  if (ungrouped.size > 0) {
    throw new Error(
      `Packages missing from the unit tests groups: ${[...ungrouped].join(', ')}`,
    );
  }

  return {
    isPluginAffected: affected.includes('eslint-plugin'),

    projectServicePackages: PROJECT_SERVICE_PACKAGES.filter(pkg =>
      affected.includes(pkg),
    ),

    snapshotPackages: SNAPSHOT_CHECK_PACKAGES.filter(pkg =>
      affected.includes(pkg),
    ),

    unitTestsMatrix: [
      // Linux groups run all their packages so each group's Codecov upload always has the same flags.
      // Otherwise, Codecov drops the group's previous upload, including packages that didn't run.
      ...toMatrix(
        'ubuntu-latest',
        LINUX_GROUPS.filter(group =>
          group.some(pkg => unitTests.includes(pkg)),
        ),
        LINUX_GROUPS.flat(),
      ),
      ...toMatrix('windows-latest', WINDOWS_GROUPS, unitTests),
    ],
  };
}
