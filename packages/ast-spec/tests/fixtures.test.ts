import fs from 'fs';
import glob from 'glob';
import makeDir from 'make-dir';
import path from 'path';

import { parseBabel } from './util/parsers/babel';
import type {
  Fixture,
  ParserResponse,
  ParserResponseError,
  ParserResponseSuccess,
} from './util/parsers/parser-types';
import { ParserResponseType } from './util/parsers/parser-types';
import { parseTSESTree } from './util/parsers/typescript-estree';
import { diffHasChanges, snapshotDiff } from './util/snapshot-diff';
import { serializeError } from './util/serialize-error';

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
  TSESTree = "TSESTree errored but Babel didn't",
  Babel = "Babel errored but TSESTree didn't",
  Both = 'Both errored',
  None = 'No errors',
}
const fixturesWithErrorDifferences = {
  [ErrorLabel.TSESTree]: new Set<string>(),
  [ErrorLabel.Babel]: new Set<string>(),
} as const;

const VALID_FIXTURES: readonly string[] = glob.sync(
  `**/fixtures/*/fixture.{ts,tsx}`,
  {
    cwd: SRC_DIR,
    absolute: true,
  },
);
const ERROR_FIXTURES: readonly string[] = glob.sync(
  `**/fixtures/_error_/*/fixture.{ts,tsx}`,
  {
    cwd: SRC_DIR,
    absolute: true,
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
          return require(configPath).default;
        } catch {
          return {};
        }
      })(),
      ext,
      isError: absolute.includes('/_error_/'),
      isJSX: ext.endsWith('x'),
      name,
      relative: path.relative(SRC_DIR, absolute).replace(/\\/g, '/'),
      segments,
      snapshotFiles: {
        success: {
          tsestree: {
            ast: (i: number) =>
              path.join(snapshotPath, `${i}-TSESTree-AST.shot`),
            tokens: (i: number) =>
              path.join(snapshotPath, `${i}-TSESTree-Tokens.shot`),
          },
          babel: {
            ast: (i: number) => path.join(snapshotPath, `${i}-Babel-AST.shot`),
            tokens: (i: number) =>
              path.join(snapshotPath, `${i}-Babel-Tokens.shot`),
          },
          alignment: {
            ast: (i: number) =>
              path.join(snapshotPath, `${i}-AST-Alignment-AST.shot`),
            tokens: (i: number) =>
              path.join(snapshotPath, `${i}-AST-Alignment-Tokens.shot`),
          },
        },
        error: {
          tsestree: (i: number) =>
            path.join(snapshotPath, `${i}-TSESTree-Error.shot`),
          babel: (i: number) =>
            path.join(snapshotPath, `${i}-Babel-Error.shot`),
          alignment: (i: number) =>
            path.join(snapshotPath, `${i}-Alignment-Error.shot`),
        },
      },
      snapshotPath,
    };
  },
);

function hasErrorCode(e: unknown): e is { code: unknown } {
  return typeof e === 'object' && e != null && 'code' in e;
}

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
    const test = (): void => {
      const contents = fs.readFileSync(fixture.absolute, 'utf8');

      try {
        makeDir.sync(fixture.snapshotPath);
      } catch (e) {
        if (hasErrorCode(e) && e.code === 'EEXIST') {
          // already exists - ignored
        } else {
          throw e;
        }
      }

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

      let snapshotCounter = 1;

      if (fixture.isError) {
        if (
          errorLabel === ErrorLabel.TSESTree ||
          errorLabel === ErrorLabel.Babel
        ) {
          fixturesWithErrorDifferences[errorLabel].add(fixture.relative);
        }

        it('TSESTree - Error', () => {
          expect(
            serializeError(tsestreeParsed.error, contents),
          ).toMatchSpecificSnapshot(
            fixture.snapshotFiles.error.tsestree(snapshotCounter++),
          );
        });
        it('Babel - Error', () => {
          expect(babelParsed.error).toMatchSpecificSnapshot(
            fixture.snapshotFiles.error.babel(snapshotCounter++),
          );
        });
        it('Error Alignment', () => {
          expect(errorLabel).toMatchSpecificSnapshot(
            fixture.snapshotFiles.error.alignment(snapshotCounter++),
          );
        });
        it('Should parse with errors', () => {
          // if this fails and you WEREN'T expecting a parser error, then your fixture should not be in the `_error_` subfolder
          // if this fails and you WERE expecting a parser error - then something is broken.
          expect(errorLabel).not.toBe(ErrorLabel.None);
        });
      } else {
        it('TSESTree - AST', () => {
          expectSuccessResponse(tsestreeParsed);
          expect(tsestreeParsed.ast).toMatchSpecificSnapshot(
            fixture.snapshotFiles.success.tsestree.ast(snapshotCounter++),
          );
        });
        it('TSESTree - Tokens', () => {
          expectSuccessResponse(tsestreeParsed);
          expect(tsestreeParsed.tokens).toMatchSpecificSnapshot(
            fixture.snapshotFiles.success.tsestree.tokens(snapshotCounter++),
          );
        });

        if (fixture.config.expectBabelToNotSupport != null) {
          fixturesConfiguredToExpectBabelToNotSupport.set(
            fixture.relative,
            fixture.config.expectBabelToNotSupport,
          );

          // eslint-disable-next-line jest/no-identical-title -- intentional duplication that won't ever happen due to exclusionary conditions
          it('Babel - Error', () => {
            expect(babelParsed.error).toMatchSpecificSnapshot(
              fixture.snapshotFiles.error.babel(snapshotCounter++),
            );
          });
          // eslint-disable-next-line jest/no-disabled-tests -- intentional skip for CLI documentation purposes
          it.skip('Babel - Skipped as this fixture is configured to expect babel to error', () => {});
          // eslint-disable-next-line jest/no-disabled-tests -- intentional skip for CLI documentation purposes
          it.skip('AST Alignment - Skipped as this fixture is configured to expect babel to error', () => {});
        } else {
          it('Babel - AST', () => {
            expectSuccessResponse(babelParsed);
            expect(babelParsed.ast).toMatchSpecificSnapshot(
              fixture.snapshotFiles.success.babel.ast(snapshotCounter++),
            );
          });
          it('Babel - Tokens', () => {
            expectSuccessResponse(babelParsed);
            expect(babelParsed.tokens).toMatchSpecificSnapshot(
              fixture.snapshotFiles.success.babel.tokens(snapshotCounter++),
            );
          });
          it('AST Alignment - AST', () => {
            expectSuccessResponse(tsestreeParsed);
            expectSuccessResponse(babelParsed);
            const diffResult = snapshotDiff(
              'TSESTree',
              tsestreeParsed.ast,
              'Babel',
              babelParsed.ast,
            );
            expect(diffResult).toMatchSpecificSnapshot(
              fixture.snapshotFiles.success.alignment.ast(snapshotCounter++),
            );

            if (diffHasChanges(diffResult)) {
              fixturesWithASTDifferences.add(fixture.relative);
            }
          });
          it('AST Alignment - Token', () => {
            expectSuccessResponse(tsestreeParsed);
            expectSuccessResponse(babelParsed);
            const diffResult = snapshotDiff(
              'TSESTree',
              tsestreeParsed.tokens,
              'Babel',
              babelParsed.tokens,
            );
            expect(diffResult).toMatchSpecificSnapshot(
              fixture.snapshotFiles.success.alignment.tokens(snapshotCounter++),
            );

            if (diffHasChanges(diffResult)) {
              fixturesWithTokenDifferences.add(fixture.relative);
            }
          });
        }

        it('Should parse with no errors', () => {
          // log the error for debug purposes in case there wasn't supposed to be an error
          switch (errorLabel) {
            case ErrorLabel.None:
              return;

            case ErrorLabel.Babel:
              expectErrorResponse(babelParsed);
              if (fixture.config.expectBabelToNotSupport == null) {
                console.error('Babel:\n', babelParsed.error);
              }
              break;

            case ErrorLabel.TSESTree:
              expectErrorResponse(tsestreeParsed);
              console.error('TSESTree:\n', tsestreeParsed.error);
              break;

            case ErrorLabel.Both:
              expectErrorResponse(babelParsed);
              expectErrorResponse(tsestreeParsed);
              console.error('Babel:\n', babelParsed.error);
              console.error('TSESTree:\n', tsestreeParsed.error);
              break;
          }

          // NOTE - the comments below exist so that they show up in the stack trace jest shows
          //        when the test fails. Yes, sadly, they're duplicated, but it's necessary to
          //        provide the best and most understandable DevX that we can here.
          //        Jest will print a code frame with the fail line as well as 2 lines before and after

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

    if ([...fixture.segments, fixture.name].join(path.sep) === ONLY) {
      // eslint-disable-next-line jest/no-focused-tests -- intentional focused test that only happens during development
      describe.only(fixture.name, test);
    } else {
      describe(fixture.name, test);
    }
  }
}

describe('AST Fixtures', () => {
  FIXTURES.forEach(f => nestDescribe(f));

  // once we've run all the tests, snapshot the list of fixtures that have differences for easy reference
  it('List fixtures with AST differences', () => {
    expect(fixturesWithASTDifferences).toMatchSpecificSnapshot(
      path.resolve(__dirname, 'fixtures-with-differences-ast.shot'),
    );
  });
  it('List fixtures with Token differences', () => {
    expect(fixturesWithTokenDifferences).toMatchSpecificSnapshot(
      path.resolve(__dirname, 'fixtures-with-differences-tokens.shot'),
    );
  });
  it('List fixtures with Error differences', () => {
    expect(fixturesWithErrorDifferences).toMatchSpecificSnapshot(
      path.resolve(__dirname, 'fixtures-with-differences-errors.shot'),
    );
  });
  it('List fixtures we expect babel to not support', () => {
    expect(fixturesConfiguredToExpectBabelToNotSupport).toMatchSpecificSnapshot(
      path.resolve(__dirname, 'fixtures-without-babel-support.shot'),
    );
  });
});
