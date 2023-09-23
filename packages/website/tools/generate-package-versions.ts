import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import fetch from 'cross-fetch';
import * as semver from 'semver';

import rootPackageJson from '../../../package.json';

interface FetchObject {
  package: string;
  downloads: Record<string, number>;
}

/**
 * Get the latest version of each major version
 * @param versions
 */
function getLatestMajorVersions(versions: [string, number][]): string[] {
  //
  const latestMajorVersions = new Map<number, string>();

  for (const [version] of versions) {
    const major = semver.major(version);

    const latest = latestMajorVersions.get(major);

    if (!latest) {
      latestMajorVersions.set(major, version);
    } else if (semver.gt(version, latest)) {
      latestMajorVersions.set(major, version);
    }
  }

  return Array.from(latestMajorVersions.values());
}

/**
 * Get the 10 most popular versions
 * @param versions
 */
function getMostPopularVersions(versions: [string, number][]): string[] {
  return versions
    .sort(([, a], [, b]) => (a === b ? 0 : a < b ? 1 : -1))
    .slice(0, 15)
    .map(([version]) => version);
}

/**
 * Group versions by major and minor version
 * @param versions
 */
function groupByVersion(versions: [string, number][]): [string, number][] {
  const groups = new Map<string, [string, number]>();

  for (const [version, downloads] of versions) {
    const parsed = semver.parse(version);
    if (!parsed) {
      continue;
    }
    const name = `${parsed.major}.${parsed.minor}`;
    const group = groups.get(name);
    if (!group) {
      groups.set(name, [version, downloads]);
    } else {
      if (semver.gt(version, group[0])) {
        group[0] = version;
      }
      group[1] += downloads;
      groups.set(name, group);
    }
  }

  return Array.from(groups.values());
}

function sortAndFilter(
  downloads: Record<string, number>,
  allowList: string,
): string[] {
  const versions = Object.entries(downloads).filter(
    ([version]) =>
      !version.includes('-') && semver.satisfies(version, allowList),
  );

  const grouped = groupByVersion(versions);

  const popular = new Set([
    ...getMostPopularVersions(grouped),
    ...getLatestMajorVersions(grouped),
  ]);

  return Array.from(popular).sort(semver.rcompare);
}

async function getPackageStats(
  packageName: string,
  allowList: string,
): Promise<string[]> {
  const encodedPackageName = encodeURIComponent(packageName);
  const response = await fetch(
    `https://api.npmjs.org/versions/${encodedPackageName}/last-week`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const result = (await response.json()) as FetchObject;
  return sortAndFilter(result.downloads, allowList);
}

async function main(): Promise<void> {
  const packages = await Promise.all([
    getPackageStats('typescript', rootPackageJson.devDependencies.typescript),
    // getPackageStats('@typescript-eslint/eslint-plugin', '^5.0.0'),
    // getPackageStats('eslint', '^6.0.0 || ^7.0.0 || ^8.0.0'),
  ]);

  const result = {
    typescript: packages[0],
    // 'eslint-plugin': packages[1],
    // eslint: packages[2],
  };

  const fileUrl = path.join(
    __dirname,
    '../src/components/packageVersions.json',
  );

  await fs.writeFile(fileUrl, JSON.stringify(result, null, 2) + '\n', 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
