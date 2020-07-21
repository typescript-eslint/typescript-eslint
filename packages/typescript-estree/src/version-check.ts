import * as semver from 'semver';
import * as ts from 'typescript';

function semverCheck(version: string): boolean {
  return semver.satisfies(
    ts.version,
    `>= ${version}.0 || >= ${version}.1-rc || >= ${version}.0-beta`,
    {
      includePrerelease: true,
    },
  );
}

const versions = [
  //
  '3.7',
  '3.8',
  '3.9',
  '4.0',
] as const;
type Versions = typeof versions extends ArrayLike<infer U> ? U : never;

const typescriptVersionIsAtLeast = {} as Record<Versions, boolean>;
for (const version of versions) {
  typescriptVersionIsAtLeast[version] = semverCheck(version);
}

export { typescriptVersionIsAtLeast };
