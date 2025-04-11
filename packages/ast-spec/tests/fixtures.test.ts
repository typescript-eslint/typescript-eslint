import * as glob from 'glob';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { VitestSnapshotEnvironment } from 'vitest/snapshot';

import type {
  Fixture,
  ParserResponse,
  ParserResponseError,
  ParserResponseSuccess,
} from './util/parsers/parser-types';

import { parseBabel } from './util/parsers/babel';
import { ParserResponseType } from './util/parsers/parser-types';
import { parseTSESTree } from './util/parsers/typescript-estree';
import { serializeError } from './util/serialize-error';
import { diffHasChanges, snapshotDiff } from './util/snapshot-diff';

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(PACKAGE_ROOT, 'src');

// Assign a segment set to this variable to limit the test to only this segment
// This is super helpful if you need to debug why a specific fixture isn't producing the correct output
// eg. ['declaration', 'ClassDeclaration', 'abstract'] will only test /declaration/ClassDeclaration/fixtures/abstract/fixture.ts
// prettier-ignore
const ONLY = [].join(path.sep);

const fixturesWithASTDifferences = new Set<string>();
const fixturesWithTokenDifferences = new Set<string>();
const fixturesConfiguredToExpectBabelToNotSupport = new Map<string, string>();
enum ErrorLabel {
  Babel = "Babel errored but TSESTree didn't",
  Both = 'Both errored',
  None = 'No errors',
  TSESTree = "TSESTree errored but Babel didn't",
}
const fixturesWithErrorDifferences = {
  [ErrorLabel.Babel]: new Set<string>(),
  [ErrorLabel.TSESTree]: new Set<string>(),
} as const;

const VALID_FIXTURES: readonly string[] = glob.sync(
  `**/fixtures/*/fixture.{ts,tsx}`,
  {
    absolute: true,
    cwd: SRC_DIR,
  },
);
const ERROR_FIXTURES: readonly string[] = glob.sync(
  `**/fixtures/_error_/*/fixture.{ts,tsx}`,
  {
    absolute: true,
    cwd: SRC_DIR,
  },
);

const FIXTURES: readonly Fixture[] = [...VALID_FIXTURES, ...ERROR_FIXTURES].map(
  absolute => {
    const relativeToSrc = path.relative(SRC_DIR, absolute);
    const { dir, ext } = path.parse(relativeToSrc);
    const segments = dir.split(path.sep).filter(s => s !== 'fixtures');
    const name = segments.pop()!;
    const fixtureDir = path.join(SRC_DIR, dir);
    const configPath = path.join(fixtureDir, 'config' /* .ts */);
    const snapshotPath = path.join(fixtureDir, 'snapshots');
    return {
      absolute,
      config: ((): ASTFixtureConfig => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          return require(configPath).default;
        } catch {
          return {};
        }
      })(),
      ext,
      isError: /[\\/]_error_[\\/]/.test(absolute),
      isJSX: ext.endsWith('x'),
      name,
      relative: path.relative(SRC_DIR, absolute).replaceAll('\\', '/'),
      segments,
      snapshotFiles: {
        error: {
          alignment: (i: number) =>
            path.join(snapshotPath, `${i}-Alignment-Error.shot`),
          babel: (i: number) =>
            path.join(snapshotPath, `${i}-Babel-Error.shot`),
          tsestree: (i: number) =>
            path.join(snapshotPath, `${i}-TSESTree-Error.shot`),
        },
        success: {
          alignment: {
            ast: (i: number) =>
              path.join(snapshotPath, `${i}-AST-Alignment-AST.shot`),
            tokens: (i: number) =>
              path.join(snapshotPath, `${i}-AST-Alignment-Tokens.shot`),
          },
          babel: {
            ast: (i: number) => path.join(snapshotPath, `${i}-Babel-AST.shot`),
            tokens: (i: number) =>
              path.join(snapshotPath, `${i}-Babel-Tokens.shot`),
          },
          tsestree: {
            ast: (i: number) =>
              path.join(snapshotPath, `${i}-TSESTree-AST.shot`),
            tokens: (i: number) =>
              path.join(snapshotPath, `${i}-TSESTree-Tokens.shot`),
          },
        },
      },
      snapshotPath,
    };
  },
);

function expectSuccessResponse(
  thing: ParserResponse,
): asserts thing is ParserResponseSuccess {
  expect(thing.type).toEqual(ParserResponseType.NoError);
}
function expectErrorResponse(
  thing: ParserResponse,
): asserts thing is ParserResponseError {
  expect(thing.type).toEqual(ParserResponseType.Error);
}

function nestDescribe(fixture: Fixture, segments = fixture.segments): void {
  if (segments.length > 0) {
    describe(segments[0], () => {
      nestDescribe(fixture, segments.slice(1));
    });
  } else {
    const test = async (): Promise<void> => {
      const vitestSnapshotHeader = new VitestSnapshotEnvironment({
        snapshotsDirName: fixture.snapshotPath,
      }).getHeader();

      const contents = await fs.readFile(fixture.absolute, {
        encoding: 'utf-8',
      });

      await fs.mkdir(fixture.snapshotPath, { recursive: true });

      const tsestreeParsed = parseTSESTree(fixture, contents);
      const babelParsed = parseBabel(fixture, contents);
      const babelError = babelParsed.type === ParserResponseType.Error;
      const tsestreeError = tsestreeParsed.type === ParserResponseType.Error;

      let errorLabel: ErrorLabel;
      if (!babelError && tsestreeError) {
        errorLabel = ErrorLabel.TSESTree;
      } else if (babelError && !tsestreeError) {
        errorLabel = ErrorLabel.Babel;
      } else if (babelError && tsestreeError) {
        errorLabel = ErrorLabel.Both;
      } else {
        errorLabel = ErrorLabel.None;
      }

      if (fixture.isError) {
        if (
          errorLabel === ErrorLabel.TSESTree ||
          errorLabel === ErrorLabel.Babel
        ) {
          fixturesWithErrorDifferences[errorLabel].add(fixture.relative);
        }

        it('TSESTree - Error', async () => {
          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              serializeError(tsestreeParsed.error, contents),
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(
            fixture.snapshotFiles.error.tsestree(segments.length + 1),
          );
        });
        it('Babel - Error', async () => {
          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              babelParsed.error,
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(
            fixture.snapshotFiles.error.babel(segments.length + 2),
          );
        });
        it('Error Alignment', async () => {
          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              errorLabel,
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(
            fixture.snapshotFiles.error.alignment(segments.length + 3),
          );
        });
        it('Should parse with errors', () => {
          // if this fails and you WEREN'T expecting a parser error, then your fixture should not be in the `_error_` subfolder
          // if this fails and you WERE expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.None);
        });
      } else {
        it('TSESTree - AST', async () => {
          expectSuccessResponse(tsestreeParsed);
          await expect(tsestreeParsed.ast).toMatchFileSnapshot(
            fixture.snapshotFiles.success.tsestree.ast(segments.length + 1),
          );
        });
        it('TSESTree - Tokens', async () => {
          expectSuccessResponse(tsestreeParsed);
          await expect(tsestreeParsed.tokens).toMatchFileSnapshot(
            fixture.snapshotFiles.success.tsestree.tokens(segments.length + 2),
          );
        });

        if (fixture.config.expectBabelToNotSupport != null) {
          fixturesConfiguredToExpectBabelToNotSupport.set(
            fixture.relative,
            fixture.config.expectBabelToNotSupport,
          );

          // eslint-disable-next-line vitest/no-identical-title -- intentional duplication that won't ever happen due to exclusionary conditions
          it('Babel - Error', async () => {
            await expect(
              [
                `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
                babelParsed.error,
                '',
              ].join('\n'),
            ).toMatchFileSnapshot(
              fixture.snapshotFiles.error.babel(segments.length + 3),
            );
          });
          // eslint-disable-next-line vitest/no-disabled-tests -- intentional skip for CLI documentation purposes
          it.skip('Babel - Skipped as this fixture is configured to expect babel to error', () => {});
          // eslint-disable-next-line vitest/no-disabled-tests -- intentional skip for CLI documentation purposes
          it.skip('AST Alignment - Skipped as this fixture is configured to expect babel to error', () => {});
        } else {
          it('Babel - AST', async () => {
            expectSuccessResponse(babelParsed);
            await expect(babelParsed.ast).toMatchFileSnapshot(
              fixture.snapshotFiles.success.babel.ast(segments.length + 3),
            );
          });
          it('Babel - Tokens', async () => {
            expectSuccessResponse(babelParsed);
            await expect(babelParsed.tokens).toMatchFileSnapshot(
              fixture.snapshotFiles.success.babel.tokens(segments.length + 4),
            );
          });
          it('AST Alignment - AST', async () => {
            expectSuccessResponse(tsestreeParsed);
            expectSuccessResponse(babelParsed);
            const diffResult = snapshotDiff(
              'TSESTree',
              tsestreeParsed.ast,
              'Babel',
              babelParsed.ast,
            );
            await expect(
              [
                `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
                diffResult,
                '',
              ].join('\n'),
            ).toMatchFileSnapshot(
              fixture.snapshotFiles.success.alignment.ast(segments.length + 5),
            );

            if (diffHasChanges(diffResult)) {
              fixturesWithASTDifferences.add(fixture.relative);
            }
          });
          it('AST Alignment - Token', async () => {
            expectSuccessResponse(tsestreeParsed);
            expectSuccessResponse(babelParsed);
            const diffResult = snapshotDiff(
              'TSESTree',
              tsestreeParsed.tokens,
              'Babel',
              babelParsed.tokens,
            );
            await expect(
              [
                `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
                diffResult,
                '',
              ].join('\n'),
            ).toMatchFileSnapshot(
              fixture.snapshotFiles.success.alignment.tokens(
                segments.length + 6,
              ),
            );

            if (diffHasChanges(diffResult)) {
              fixturesWithTokenDifferences.add(fixture.relative);
            }
          });
        }

        it('Should parse with no errors', () => {
          // log the error for debug purposes in case there wasn't supposed to be an error
          switch (errorLabel) {
            case ErrorLabel.Babel:
              expectErrorResponse(babelParsed);
              if (fixture.config.expectBabelToNotSupport == null) {
                console.error('Babel:\n', babelParsed.error);
              }
              break;

            case ErrorLabel.Both:
              expectErrorResponse(babelParsed);
              expectErrorResponse(tsestreeParsed);
              console.error('Babel:\n', babelParsed.error);
              console.error('TSESTree:\n', tsestreeParsed.error);
              break;

            case ErrorLabel.None:
              return;

            case ErrorLabel.TSESTree:
              expectErrorResponse(tsestreeParsed);
              console.error('TSESTree:\n', tsestreeParsed.error);
              break;
          }

          // NOTE - the comments below exist so that they show up in the stack trace jest shows
          //        when the test fails. Yes, sadly, they're duplicated, but it's necessary to
          //        provide the best and most understandable DevX that we can here.
          //        Vitest will print a code frame with the fail line as well as 2 lines before and after

          // if this fails and you WERE expecting a parser error, then your fixture should be in the `_error_` subfolder
          // if this fails and you WEREN'T expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.TSESTree);

          // if this fails and you WERE expecting a parser error, then your fixture should be in the `_error_` subfolder
          // if this fails and you WEREN'T expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.Both);

          if (fixture.config.expectBabelToNotSupport != null) {
            // if this fails and you WERE expecting a parser error, then Babel parsed without error and you should remove the `expectBabelToNotSupport` config.
            expect(errorLabel).toBe(ErrorLabel.Babel);
          } else {
            // if this fails and you WERE expecting a parser error, then your fixture should be in the `_error_` subfolder
            // if this fails and you WEREN'T expecting a parser error - then something is broken.
            expect(errorLabel).not.toBe(ErrorLabel.Babel);
          }
        });
      }
    };

    describe(
      fixture.name,
      { only: [...fixture.segments, fixture.name].join(path.sep) === ONLY },
      test,
    );
  }
}

describe('AST Fixtures', async () => {
  await Promise.all(FIXTURES.map(f => nestDescribe(f)));

  const vitestSnapshotHeader = new VitestSnapshotEnvironment({
    snapshotsDirName: __dirname,
  }).getHeader();

  // once we've run all the tests, snapshot the list of fixtures that have differences for easy reference
  it('List fixtures with AST differences', async () => {
    await expect(
      [
        `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
        JSON.stringify([...fixturesWithASTDifferences].sort(), null, 2),
        '',
      ].join('\n'),
    ).toMatchFileSnapshot(
      path.resolve(__dirname, 'fixtures-with-differences-ast.shot'),
    );
  });
  it('List fixtures with Token differences', async () => {
    await expect(
      [
        `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
        JSON.stringify([...fixturesWithTokenDifferences].sort(), null, 2),
        '',
      ].join('\n'),
    ).toMatchFileSnapshot(
      path.resolve(__dirname, 'fixtures-with-differences-tokens.shot'),
    );
  });
  it('List fixtures with Error differences', async () => {
    await expect(
      [
        `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(fixturesWithErrorDifferences).map(([key, value]) => [
              key,
              [...value].sort(),
            ]),
          ),
          null,
          2,
        ),
        '',
      ].join('\n'),
    ).toMatchFileSnapshot(
      path.resolve(__dirname, 'fixtures-with-differences-errors.shot'),
    );
  });
  it('List fixtures we expect babel to not support', async () => {
    await expect(
      [
        `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
        JSON.stringify(
          [...fixturesConfiguredToExpectBabelToNotSupport].sort(),
          null,
          2,
        ),
        '',
      ].join('\n'),
    ).toMatchFileSnapshot(
      path.resolve(__dirname, 'fixtures-without-babel-support.shot'),
    );
  });
});
