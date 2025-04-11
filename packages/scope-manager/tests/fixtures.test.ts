import * as glob from 'glob';
import * as fs from 'node:fs/promises';
import path from 'node:path';

import type { AnalyzeOptions } from './test-utils';

import { parseAndAnalyze } from './test-utils';

// Assign a segment set to this variable to limit the test to only this segment
// This is super helpful if you need to debug why a specific fixture isn't producing the correct output
// eg. ['type-declaration', 'signatures', 'method-generic'] will only test /type-declaration/signatures/method-generic.ts
// prettier-ignore
const ONLY = [].join(path.sep);

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

const fixtures = glob
  .sync('**/*.{js,ts,jsx,tsx}', {
    absolute: true,
    cwd: FIXTURES_DIR,
    ignore: ['fixtures.test.ts'],
  })
  .map(absolute => {
    const relative = path.relative(FIXTURES_DIR, absolute);
    const { dir, ext, name } = path.parse(relative);
    const segments = dir.split(path.sep);
    const snapshotPath = path.join(FIXTURES_DIR, dir);
    return {
      absolute,
      ext,
      name,
      segments,
      snapshotFile: path.join(snapshotPath, `${name}${ext}.shot`),
      snapshotPath,
    };
  });

const FOUR_SLASH = /^\/{4} +@(\w+) *= *(.+)$/;
const QUOTED_STRING = /^["'](.+?)['"]$/;
type ALLOWED_VALUE = ['boolean' | 'number' | 'string', Set<unknown>?];
const ALLOWED_OPTIONS: Map<string, ALLOWED_VALUE> = new Map<
  keyof AnalyzeOptions,
  ALLOWED_VALUE
>([
  ['globalReturn', ['boolean']],
  ['impliedStrict', ['boolean']],
  ['jsxFragmentName', ['string']],
  ['jsxPragma', ['string']],
  ['sourceType', ['string', new Set(['module', 'script'])]],
]);

function nestDescribe(
  fixture: (typeof fixtures)[number],
  segments = fixture.segments,
): void {
  if (segments.length > 0) {
    describe(segments[0], () => {
      nestDescribe(fixture, segments.slice(1));
    });
  } else {
    test(
      fixture.name,
      { only: [...fixture.segments, fixture.name].join(path.sep) === ONLY },
      async () => {
        const contents = await fs.readFile(fixture.absolute, {
          encoding: 'utf-8',
        });

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
            throw new Error(
              `Four-slash did not match expected format: ${line}`,
            );
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
              `Expected value for ${key} to be one of (${[...type[1]].join(
                ' | ',
              )}), but got ${value as string}`,
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

        await fs.mkdir(fixture.snapshotPath, { recursive: true });

        try {
          const { scopeManager } = parseAndAnalyze(contents, options, {
            jsx: fixture.ext.endsWith('x'),
          });
          await expect(scopeManager).toMatchFileSnapshot(fixture.snapshotFile);
        } catch (e) {
          await expect(e).toMatchFileSnapshot(fixture.snapshotFile);
        }
      },
    );
  }
}

fixtures.forEach(f => nestDescribe(f));

describe.runIf(ONLY === '')(
  'ast snapshots should have an associated test',
  () => {
    const snapshots = glob.sync(`${FIXTURES_DIR}/**/*.shot`).map(absolute => {
      const relative = path.relative(FIXTURES_DIR, absolute);
      const { dir, name } = path.parse(relative);
      return [relative, path.join(FIXTURES_DIR, dir, name)] as const;
    });
    it.for(snapshots)('%s', async ([, fixturePath], { expect }) => {
      expect((await fs.stat(fixturePath)).isFile()).toBe(true);
    });
  },
);
