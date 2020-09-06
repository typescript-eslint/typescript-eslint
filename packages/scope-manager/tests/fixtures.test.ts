import fs from 'fs';
import glob from 'glob';
import makeDir from 'make-dir';
import path from 'path';
import { parseAndAnalyze, AnalyzeOptions } from './util';

// Assign a segment set to this variable to limit the test to only this segment
// This is super helpful if you need to debug why a specific fixture isn't producing the correct output
// eg. ['type-declaration', 'signatures', 'method-generic'] will only test /type-declaration/signatures/method-generic.ts
// prettier-ignore
const ONLY = [].join(path.sep);

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

const fixtures = glob
  .sync(`${FIXTURES_DIR}/**/*.{js,ts,jsx,tsx}`, {
    ignore: ['fixtures.test.ts'],
  })
  .map(absolute => {
    const relative = path.relative(FIXTURES_DIR, absolute);
    const { name, dir, ext } = path.parse(relative);
    const segments = dir.split(path.sep);
    const snapshotPath = path.join(FIXTURES_DIR, dir);
    return {
      absolute,
      name,
      ext,
      segments,
      snapshotPath,
      snapshotFile: path.join(snapshotPath, `${name}${ext}.shot`),
    };
  });

const FOUR_SLASH = /^\/\/\/\/[ ]+@(\w+)[ ]*=[ ]*(.+)$/;
const QUOTED_STRING = /^["'](.+?)['"]$/;
type ALLOWED_VALUE = ['number' | 'boolean' | 'string', Set<unknown>?];
const ALLOWED_OPTIONS: Map<string, ALLOWED_VALUE> = new Map<
  keyof AnalyzeOptions,
  ALLOWED_VALUE
>([
  ['ecmaVersion', ['number']],
  ['globalReturn', ['boolean']],
  ['impliedStrict', ['boolean']],
  ['jsxPragma', ['string']],
  ['jsxFragmentName', ['string']],
  ['sourceType', ['string', new Set(['module', 'script'])]],
]);

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

      const lines = contents.split('\n');
      const options: Record<string, unknown> = {
        lib: [],
      };

      /*
       * What's all this!?
       *
       * To help with configuring individual tests, each test may use a four-slash comment to configure the scope manager
       * This is just a rudimentary "parser" for said comments.
       */
      for (const line of lines) {
        if (!line.startsWith('////')) {
          continue;
        }

        const match = FOUR_SLASH.exec(line);
        if (!match) {
          throw new Error(`Four-slash did not match expected format: ${line}`);
        }
        const [, key, rawValue] = match;
        const type = ALLOWED_OPTIONS.get(key);
        if (!type) {
          throw new Error(`Unknown option ${key}`);
        }

        let value: unknown = rawValue;
        switch (type[0]) {
          case 'string': {
            const strmatch = QUOTED_STRING.exec(rawValue);
            if (strmatch) {
              value = strmatch[1];
            }
            break;
          }

          case 'number': {
            const parsed = parseFloat(rawValue);
            if (isNaN(parsed)) {
              throw new Error(
                `Expected a number for ${key}, but got ${rawValue}`,
              );
            }
            value = parsed;
            break;
          }

          case 'boolean': {
            if (rawValue === 'true') {
              value = true;
            } else if (rawValue === 'false') {
              value = false;
            } else {
              throw new Error(
                `Expected a boolean for ${key}, but got ${rawValue}`,
              );
            }
            break;
          }
        }

        if (type[1] && !type[1].has(value)) {
          throw new Error(
            `Expected value for ${key} to be one of (${Array.from(type[1]).join(
              ' | ',
            )}), but got ${value}`,
          );
        }

        if (value === 'true') {
          options[key] = true;
        } else if (value === 'false') {
          options[key] = false;
        } else {
          options[key] = value;
        }
      }

      try {
        makeDir.sync(fixture.snapshotPath);
      } catch (e) {
        if ('code' in e && e.code === 'EEXIST') {
          // already exists - ignored
        } else {
          throw e;
        }
      }

      try {
        const { scopeManager } = parseAndAnalyze(contents, options, {
          jsx: fixture.ext.endsWith('x'),
        });
        expect(scopeManager).toMatchSpecificSnapshot(fixture.snapshotFile);
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
  const snapshots = glob.sync(`${FIXTURES_DIR}/**/*.shot`).map(absolute => {
    const relative = path.relative(FIXTURES_DIR, absolute);
    const { name, dir } = path.parse(relative);
    return {
      relative,
      fixturePath: path.join(FIXTURES_DIR, dir, name),
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
