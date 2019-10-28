import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

function main(): void {
  const fixtureFolder = 'fixtures';
  const fixtureGroups = fs.readdirSync(fixtureFolder);
  fixtureGroups.forEach(groupName => {
    const groupFolder = path.join(fixtureFolder, groupName);
    handleGroup(groupFolder);
  });

  function handleGroup(groupFolder: string): void {
    const fixtures = fs.readdirSync(groupFolder);
    fixtures.forEach(fileOrSubGroupName => {
      const fileOrSubGroupPath = path.join(groupFolder, fileOrSubGroupName);
      if (fs.statSync(fileOrSubGroupPath).isDirectory()) {
        handleGroup(fileOrSubGroupPath);
      } else {
        createTest(fileOrSubGroupPath, 'typescript-estree');
        createTest(fileOrSubGroupPath, 'parser');
      }
    });
  }
}

function createTest(
  fixturePath: string,
  moduleName: 'parser' | 'typescript-estree',
): void {
  const fixtureWithoutExt = fixturePath
    // fixtures all end in /.src.[jt]sx?/
    .substring(0, fixturePath.indexOf('.'))
    // mark them as generated
    .replace('fixtures/', 'generated/');

  const testDir = path.resolve(
    __dirname,
    '..',
    '..',
    moduleName,
    'tests',
    'shared-fixtures',
    fixtureWithoutExt,
  );

  // create the folder and all parent folders
  mkdirp.sync(testDir);

  // create test files
  fs.writeFileSync(
    path.join(testDir, 'withLocationInfo.test.ts'),
    testContents(fixturePath, 'With'),
    'utf8',
  );
  // TODO - waiting for https://github.com/typescript-eslint/typescript-eslint/pull/704
  // fs.writeFileSync(
  //   path.join(testDir, 'withoutLocationInfo.test.ts'),
  //   testContents(fixturePath, 'Without'),
  //   'utf8',
  // );

  console.log('wrote tests:', path.relative(__dirname, testDir));
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
