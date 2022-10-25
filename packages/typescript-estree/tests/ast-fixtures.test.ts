import fs from 'fs';
import glob from 'glob';
import { addSerializer } from 'jest-specific-snapshot';
import makeDir from 'make-dir';
import path from 'path';

import { parseAndGenerateServices } from '../src/parser';
import { isJSXFileType } from '../tools/test-utils';
import { serializer } from '../tools/tserror-serializer';

addSerializer(serializer);

// Assign a segment set to this variable to limit the test to only this segment
// This is super helpful if you need to debug why a specific fixture isn't producing the correct output
// eg. ['type-declaration', 'signatures', 'method-generic.src'] will only test /type-declaration/signatures/method-generic.src.ts
// prettier-ignore
const ONLY = [].join(path.sep);

const fixturesDir = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'node_modules',
  '@typescript-eslint',
  'shared-fixtures',
  'fixtures',
);
const snapshotsDir = path.resolve(__dirname, 'snapshots');

const fixtures = glob
  .sync(`**/*.src.{js,ts,jsx,tsx}`, { cwd: fixturesDir, absolute: true })
  .map(absolute => {
    const relative = path.relative(fixturesDir, absolute);
    const { name, dir, ext } = path.parse(relative);
    const segments = dir.split(path.sep);
    const snapshotPath = path.join(snapshotsDir, dir);
    return {
      absolute,
      isJsx: isJSXFileType(ext),
      name,
      segments,
      snapshotPath,
      snapshotFile: path.join(snapshotPath, `${name}${ext}.shot`),
    };
  });

function nestDescribe(
  fixture: typeof fixtures[number],
  segments = fixture.segments,
): void {
  if (segments.length > 0) {
    describe(segments[0], () => {
      nestDescribe(fixture, segments.slice(1));
    });
  } else {
    const test = (): void => {
      const contents = fs.readFileSync(fixture.absolute, 'utf8');

      try {
        makeDir.sync(fixture.snapshotPath);
      } catch (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e: any
      ) {
        if ('code' in e && e.code === 'EEXIST') {
          // already exists - ignored
        } else {
          throw e;
        }
      }

      try {
        const { ast } = parseAndGenerateServices(contents, {
          comment: true,
          errorOnUnknownASTType: true,
          jsx: fixture.isJsx,
          loc: true,
          range: true,
          tokens: true,
        });
        expect(ast).toMatchSpecificSnapshot(fixture.snapshotFile);
      } catch (e) {
        expect(e).toMatchSpecificSnapshot(fixture.snapshotFile);
      }
    };

    if ([...fixture.segments, fixture.name].join(path.sep) === ONLY) {
      // eslint-disable-next-line jest/no-focused-tests
      it.only(fixture.name, test);
    } else {
      it(fixture.name, test);
    }
  }
}

fixtures.forEach(f => nestDescribe(f));

if (ONLY === '') {
  // ensure that the snapshots are cleaned up, because jest-specific-snapshot won't do this check
  const snapshots = glob
    .sync(`**/*.shot`, { cwd: snapshotsDir, absolute: true })
    .map(absolute => {
      const relative = path.relative(snapshotsDir, absolute);
      const { name, dir } = path.parse(relative);
      return {
        relative,
        fixturePath: path.join(fixturesDir, dir, name),
      };
    });

  describe('ast snapshots should have an associated test', () => {
    for (const snap of snapshots) {
      it(snap.relative, () => {
        fs.existsSync(snap.fixturePath);
      });
    }
  });
}
