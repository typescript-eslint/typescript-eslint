import chalk from 'chalk';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import rimraf from 'rimraf';
import jsxKnownIssues from '../jsx-known-issues';

const jsxFilesWithKnownIssues = jsxKnownIssues.map(f => `${f}.src.js`);
const forceOverwrite = process.argv.includes('--force');

type PackageName = 'parser' | 'typescript-estree';
// set built up over time listing the fixtures that were written
const writtenFixtures: Readonly<Record<PackageName, Set<string>>> = {
  parser: new Set(),
  'typescript-estree': new Set(),
};

const TEST_NAMES = {
  WITH_LOCATION_INFO: 'withLocationInfo.test.ts',
  WITHOUT_LOCATION_INFO: 'withoutLocationInfo.test.ts',
};

function main(): void {
  // write new fixtures this also works to build the list of fixtures that should exist,
  // so that we can later check which fixtures have been deleted.
  const fixtureFolder = 'fixtures';
  const fixtureGroups = fs.readdirSync(fixtureFolder);
  fixtureGroups.forEach(groupName => {
    const groupFolder = path.join(fixtureFolder, groupName);
    handleGroup(groupFolder, fixturePath => {
      if (
        !jsxFilesWithKnownIssues.some(jsxName => fixturePath.endsWith(jsxName))
      ) {
        createTest(fixturePath, 'typescript-estree');
        createTest(fixturePath, 'parser');
      }
    });
  });

  // cleanup deleted fixtures
  const removeTestRegEx = new RegExp(
    `[\\/\\\\]${TEST_NAMES.WITH_LOCATION_INFO}`,
  );
  (Object.keys(writtenFixtures) as PackageName[]).forEach(packageName => {
    const generatedTestDir = getPackageDirectory(packageName);
    handleGroup(generatedTestDir, fixtureFilePath => {
      if (!fixtureFilePath.endsWith(TEST_NAMES.WITH_LOCATION_INFO)) {
        return;
      }

      const fixtureDir = fixtureFilePath.replace(removeTestRegEx, '');
      if (
        !writtenFixtures[packageName].has(
          fixtureFilePath.replace(removeTestRegEx, ''),
        )
      ) {
        rimraf.sync(fixtureDir);
        console.log(
          chalk.red('deleted test:'),
          path.relative(__dirname, fixtureDir).replace(/\.\.\//g, ''),
        );
      }
    });
  });
}

function handleGroup(
  groupFolder: string,
  callback: (fixturePath: string) => void,
): void {
  const fixtures = fs.readdirSync(groupFolder);
  fixtures.forEach(fileOrSubGroupName => {
    const fileOrSubGroupPath = path.join(groupFolder, fileOrSubGroupName);
    if (fs.statSync(fileOrSubGroupPath).isDirectory()) {
      handleGroup(fileOrSubGroupPath, callback);
    } else {
      callback(fileOrSubGroupPath);
    }
  });
}

function getPackageDirectory(packageName: PackageName): string {
  return path.resolve(
    __dirname,
    '..',
    '..',
    packageName,
    'tests',
    'shared-fixtures',
  );
}

function createTest(fixturePath: string, packageName: PackageName): void {
  const fixtureWithoutExt = fixturePath
    // fixtures all end in /.src.[jt]sx?/
    .substring(0, fixturePath.indexOf('.'))
    // mark them as generated
    .replace('fixtures/', 'generated/');

  const testDir = path.resolve(
    getPackageDirectory(packageName),
    fixtureWithoutExt,
  );

  // create the folder and all parent folders
  mkdirp.sync(testDir);
  writtenFixtures[packageName].add(testDir);

  // create test files
  function writeTestFile(type: 'With' | 'Without'): void {
    const testFile = path.join(
      testDir,
      type === 'With'
        ? TEST_NAMES.WITH_LOCATION_INFO
        : TEST_NAMES.WITHOUT_LOCATION_INFO,
    );
    if (forceOverwrite || !fs.existsSync(testFile)) {
      fs.writeFileSync(testFile, testContents(fixturePath, type), 'utf8');
      console.log(
        chalk.green('wrote test:'),
        path.relative(__dirname, testFile).replace(/\.\.\//g, ''),
      );
    }
  }
  writeTestFile('With');
  // TODO - waiting for https://github.com/typescript-eslint/typescript-eslint/pull/704
  // writeTestFile('Without');
}

const testContents = (
  fixturePath: string,
  withOrWithout: 'With' | 'Without' /* You - Bono eat your heart out */,
): string =>
  `
/**
 * This file has been auto generated.
 * Do not modify this file - any manual changes to this file will be lost.
 * Run \`yarn generate-tests\` in the \`shared-fixtures\` package to regenerate.
 */

import path from 'path';
import { test${withOrWithout}Location } from 'test-fixture';

test${withOrWithout}Location(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    '${fixturePath}',
  ),
  {
    useJSXTextNode: ${fixturePath.includes('useJSXTextNode') ? true : false},
  },
);
`.trimLeft();

main();
