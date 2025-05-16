import { glob } from 'glob';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { VitestSnapshotEnvironment } from 'vitest/snapshot';

import type { ASTFixtureConfig, Fixture } from './util/parsers/parser-types.js';

import { getErrorLabel } from './util/getErrorLabel.js';
import { parseBabel } from './util/parsers/babel.js';
import { ErrorLabel, ParserResponseType } from './util/parsers/parser-types.js';
import { parseTSESTree } from './util/parsers/typescript-estree.js';
import { serializeError } from './util/serialize-error.js';
import { diffHasChanges, snapshotDiff } from './util/snapshot-diff.js';

const PACKAGE_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PACKAGE_ROOT, 'src');

// Assign a segment set to this variable to limit the test to only this segment
// This is super helpful if you need to debug why a specific fixture isn't producing the correct output
// eg. ['declaration', 'ClassDeclaration', 'abstract'] will only test /declaration/ClassDeclaration/fixtures/abstract/fixture.ts
// prettier-ignore
const ONLY = [].join(path.sep);

const fixturesWithASTDifferences = new Map<string, string>();
const fixturesWithTokenDifferences = new Map<string, string>();
const fixturesConfiguredToExpectBabelToNotSupport = new Map<string, string>();

const fixturesWithErrorDifferences = {
  [ErrorLabel.Babel]: new Set<string>(),
  [ErrorLabel.TSESTree]: new Set<string>(),
} as const;

describe('AST Fixtures', async () => {
  const VALID_FIXTURES = await glob(
    ['**/fixtures/*/fixture.ts?(x)', '**/fixtures/_error_/*/fixture.ts?(x)'],
    {
      absolute: true,
      cwd: SRC_DIR,
    },
  );

  const FIXTURES: readonly Fixture[] = await Promise.all(
    VALID_FIXTURES.map(async absolute => {
      const relativeToSrc = path.relative(SRC_DIR, absolute);
      const { base, dir, ext } = path.parse(relativeToSrc);
      const directorySegments = dir.split(path.sep);
      const segments = directorySegments.filter(
        segment => segment !== 'fixtures',
      );

      const name = segments.pop();

      assert.isDefined(name);

      const fixtureDir = path.join(SRC_DIR, dir);
      const configPath = path.join(fixtureDir, 'config.js');
      const snapshotPath = path.join(fixtureDir, 'snapshots');

      const config = await (async (): Promise<ASTFixtureConfig> => {
        try {
          const configModule = await import(pathToFileURL(configPath).href);
          return configModule.default;
        } catch {
          return {};
        }
      })();

      const isJSX = ext.endsWith('x');
      const isError = directorySegments.includes('_error_');
      const relative = path.posix.join(...directorySegments, base);

      const vitestSnapshotEnvironment = new VitestSnapshotEnvironment({
        snapshotsDirName: snapshotPath,
      });

      const vitestSnapshotHeader = vitestSnapshotEnvironment.getHeader();

      const contents = await fs.readFile(absolute, {
        encoding: 'utf-8',
      });

      await fs.mkdir(snapshotPath, { recursive: true });

      const TSESTreeParsed = parseTSESTree({ config, contents, isJSX });
      const babelParsed = parseBabel({ contents, isJSX });
      const isBabelError = babelParsed.type === ParserResponseType.Error;
      const isTSESTreeError = TSESTreeParsed.type === ParserResponseType.Error;

      const errorLabel = getErrorLabel(isBabelError, isTSESTreeError);

      if (
        errorLabel === ErrorLabel.TSESTree ||
        errorLabel === ErrorLabel.Babel
      ) {
        fixturesWithErrorDifferences[errorLabel].add(relative);
      }

      if (config.expectBabelToNotSupport != null) {
        fixturesConfiguredToExpectBabelToNotSupport.set(
          relative,
          config.expectBabelToNotSupport,
        );
      }

      if (
        TSESTreeParsed.type === ParserResponseType.NoError &&
        babelParsed.type === ParserResponseType.NoError
      ) {
        const diffAstResult = snapshotDiff(
          'TSESTree',
          TSESTreeParsed.ast,
          'Babel',
          babelParsed.ast,
        );

        const diffTokensResult = snapshotDiff(
          'TSESTree',
          TSESTreeParsed.tokens,
          'Babel',
          babelParsed.tokens,
        );

        if (diffHasChanges(diffAstResult)) {
          fixturesWithASTDifferences.set(relative, diffAstResult);
        }

        if (diffHasChanges(diffTokensResult)) {
          fixturesWithTokenDifferences.set(relative, diffTokensResult);
        }
      }

      return {
        absolute,
        babelParsed,
        config,
        contents,
        errorLabel,
        ext,
        isBabelError,
        isError,
        isJSX,
        isTSESTreeError,
        name,
        relative,
        segments,
        snapshotFiles: {
          error: {
            alignment: (i: number) =>
              path.join(snapshotPath, `${i.toString()}-Alignment-Error.shot`),

            babel: (i: number) =>
              path.join(snapshotPath, `${i.toString()}-Babel-Error.shot`),

            tsestree: (i: number) =>
              path.join(snapshotPath, `${i.toString()}-TSESTree-Error.shot`),
          },

          success: {
            alignment: {
              ast: (i: number) =>
                path.join(
                  snapshotPath,
                  `${i.toString()}-AST-Alignment-AST.shot`,
                ),

              tokens: (i: number) =>
                path.join(
                  snapshotPath,
                  `${i.toString()}-AST-Alignment-Tokens.shot`,
                ),
            },

            babel: {
              ast: (i: number) =>
                path.join(snapshotPath, `${i.toString()}-Babel-AST.shot`),

              tokens: (i: number) =>
                path.join(snapshotPath, `${i.toString()}-Babel-Tokens.shot`),
            },

            tsestree: {
              ast: (i: number) =>
                path.join(snapshotPath, `${i.toString()}-TSESTree-AST.shot`),

              tokens: (i: number) =>
                path.join(snapshotPath, `${i.toString()}-TSESTree-Tokens.shot`),
            },
          },
        },

        snapshotPath,
        TSESTreeParsed,
        vitestSnapshotHeader,
      } satisfies Fixture;
    }),
  );

  const FIXTURES_WITH_TEST_TITLES = FIXTURES.map(
    fixture => [fixture.segments.join(' > '), fixture] as const,
  );

  describe.for(FIXTURES_WITH_TEST_TITLES)('%s', ([, fixture]) => {
    describe(
      fixture.name,
      { only: [...fixture.segments, fixture.name].join(path.sep) === ONLY },
      () => {
        const {
          babelParsed,
          config,
          contents,
          errorLabel,
          isError,
          relative,
          snapshotFiles,
          TSESTreeParsed,
          vitestSnapshotHeader,
        } = fixture;

        it.runIf(isError)('TSESTree - Error', async () => {
          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              serializeError(TSESTreeParsed.error, contents),
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(snapshotFiles.error.tsestree(1));
        });

        it.runIf(isError)('Babel - Error', async () => {
          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              babelParsed.error,
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(snapshotFiles.error.babel(2));
        });

        it.runIf(isError)('Error Alignment', async () => {
          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              errorLabel,
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(snapshotFiles.error.alignment(3));
        });

        it.runIf(isError)('Should parse with errors', () => {
          // if this fails and you WEREN'T expecting a parser error, then your fixture should not be in the `_error_` subfolder
          // if this fails and you WERE expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.None);
        });

        it.skipIf(isError)('TSESTree - AST', async () => {
          assert.isSuccessResponse(TSESTreeParsed);

          await expect(TSESTreeParsed.ast).toMatchFileSnapshot(
            snapshotFiles.success.tsestree.ast(1),
          );
        });

        it.skipIf(isError)('TSESTree - Tokens', async () => {
          assert.isSuccessResponse(TSESTreeParsed);

          await expect(TSESTreeParsed.tokens).toMatchFileSnapshot(
            snapshotFiles.success.tsestree.tokens(2),
          );
        });

        const hasExpectBabelToNotSupport =
          config.expectBabelToNotSupport != null;

        // eslint-disable-next-line vitest/no-identical-title -- intentional duplication that won't ever happen due to exclusionary conditions
        it.skipIf(isError || !hasExpectBabelToNotSupport)(
          'Babel - Error',
          async () => {
            await expect(
              [
                `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
                babelParsed.error,
                '',
              ].join('\n'),
            ).toMatchFileSnapshot(snapshotFiles.error.babel(3));
          },
        );

        // eslint-disable-next-line vitest/no-disabled-tests -- intentional skip for CLI documentation purposes
        it.skip('Babel - Skipped as this fixture is configured to expect babel to error', () => {});
        // eslint-disable-next-line vitest/no-disabled-tests -- intentional skip for CLI documentation purposes
        it.skip('AST Alignment - Skipped as this fixture is configured to expect babel to error', () => {});
        it.skipIf(isError || hasExpectBabelToNotSupport)(
          'Babel - AST',
          async () => {
            assert.isSuccessResponse(babelParsed);

            await expect(babelParsed.ast).toMatchFileSnapshot(
              snapshotFiles.success.babel.ast(3),
            );
          },
        );

        it.skipIf(isError || hasExpectBabelToNotSupport)(
          'Babel - Tokens',
          async () => {
            assert.isSuccessResponse(babelParsed);

            await expect(babelParsed.tokens).toMatchFileSnapshot(
              snapshotFiles.success.babel.tokens(4),
            );
          },
        );

        it.skipIf(
          isError ||
            hasExpectBabelToNotSupport ||
            !fixturesWithASTDifferences.has(relative),
        )('AST Alignment - AST', async () => {
          const diffResult = fixturesWithASTDifferences.get(relative);

          assert.isDefined(diffResult);

          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              diffResult,
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(snapshotFiles.success.alignment.ast(5));
        });

        it.skipIf(
          isError ||
            hasExpectBabelToNotSupport ||
            !fixturesWithTokenDifferences.has(relative),
        )('AST Alignment - Token', async () => {
          const diffResult = fixturesWithTokenDifferences.get(relative);

          assert.isDefined(diffResult);

          await expect(
            [
              `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
              diffResult,
              '',
            ].join('\n'),
          ).toMatchFileSnapshot(snapshotFiles.success.alignment.tokens(6));
        });

        it.skipIf(isError)('Should parse with no errors', () => {
          switch (errorLabel) {
            case ErrorLabel.Babel:
              assert.isErrorResponse(babelParsed);

              break;

            case ErrorLabel.Both:
              assert.isErrorResponse(babelParsed);

              assert.isErrorResponse(TSESTreeParsed);

              break;

            case ErrorLabel.None:
              return;

            case ErrorLabel.TSESTree:
              assert.isErrorResponse(TSESTreeParsed);

              break;
          }

          // NOTE - the comments below exist so that they show up in the stack trace vitest shows
          //        when the test fails. Yes, sadly, they're duplicated, but it's necessary to
          //        provide the best and most understandable DevX that we can here.
          //        Vitest will print a code frame with the fail line as well as 2 lines before and after

          // if this fails and you WERE expecting a parser error, then your fixture should be in the `_error_` subfolder
          // if this fails and you WEREN'T expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.TSESTree);

          // if this fails and you WERE expecting a parser error, then your fixture should be in the `_error_` subfolder
          // if this fails and you WEREN'T expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.Both);

          // if this fails and you WERE expecting a parser error, then Babel parsed without error and you should remove the `expectBabelToNotSupport` config.
          expect(errorLabel).toBe(ErrorLabel.Babel);
        });
      },
    );
  });

  const vitestSnapshotHeader = new VitestSnapshotEnvironment({
    snapshotsDirName: __dirname,
  }).getHeader();

  // once we've run all the tests, snapshot the list of fixtures that have differences for easy reference
  it('List fixtures with AST differences', async () => {
    await expect(
      [
        `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
        JSON.stringify([...fixturesWithASTDifferences.keys()].sort(), null, 2),
        '',
      ].join('\n'),
    ).toMatchFileSnapshot(
      path.join(__dirname, 'fixtures-with-differences-ast.shot'),
    );
  });

  it('List fixtures with Token differences', async () => {
    await expect(
      [
        `${vitestSnapshotHeader}\n\nexports[\`${expect.getState().currentTestName}\`]`,
        JSON.stringify(
          [...fixturesWithTokenDifferences.keys()].sort(),
          null,
          2,
        ),
        '',
      ].join('\n'),
    ).toMatchFileSnapshot(
      path.join(__dirname, 'fixtures-with-differences-tokens.shot'),
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
      path.join(__dirname, 'fixtures-with-differences-errors.shot'),
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
      path.join(__dirname, 'fixtures-without-babel-support.shot'),
    );
  });
});
