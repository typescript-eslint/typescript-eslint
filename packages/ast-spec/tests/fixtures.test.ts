import fs from 'fs';
import glob from 'glob';
import makeDir from 'make-dir';
import path from 'path';
import { parseBabel } from './util/parsers/babel';
import {
  Fixture,
  ParserResponse,
  ParserResponseError,
  ParserResponseSuccess,
  ParserResponseType,
} from './util/parsers/parser-types';
import { parseTSESTree } from './util/parsers/typescript-estree';
import { snapshotDiff, diffHasChanges } from './util/snapshot-diff';

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(PACKAGE_ROOT, 'src');

// Assign a segment set to this variable to limit the test to only this segment
// This is super helpful if you need to debug why a specific fixture isn't producing the correct output
// eg. ['declaration', 'ClassDeclaration', 'abstract'] will only test /declaration/ClassDeclaration/fixtures/abstract/fixture.ts
// prettier-ignore
const ONLY = [].join(path.sep);

const fixturesWithASTDifferences = new Set<string>();
const fixturesWithTokenDifferences = new Set<string>();
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

const validFixtures = glob.sync(`${SRC_DIR}/**/fixtures/*/*.{ts,tsx}`);
const errorFixtures = glob.sync(`${SRC_DIR}/**/fixtures/_error_/*/*.{ts,tsx}`);

const fixtures: readonly Fixture[] = [...validFixtures, ...errorFixtures].map(
  absolute => {
    const relativeToSrc = path.relative(SRC_DIR, absolute);
    const { dir, ext } = path.parse(relativeToSrc);
    const segments = dir.split(path.sep).filter(s => s !== 'fixtures');
    const name = segments.pop()!;
    const snapshotPath = path.join(SRC_DIR, dir, 'snapshots');
    return {
      absolute,
      name,
      ext,
      isError: absolute.includes('/_error_/'),
      isJSX: ext.endsWith('x'),
      relative: path.relative(SRC_DIR, absolute),
      segments,
      snapshotPath,
      snapshotFiles: {
        success: {
          tsestree: {
            ast: path.join(snapshotPath, '1-TSESTree-AST.shot'),
            tokens: path.join(snapshotPath, '2-TSESTree-Tokens.shot'),
          },
          babel: {
            ast: path.join(snapshotPath, '3-Babel-AST.shot'),
            tokens: path.join(snapshotPath, '4-Babel-Tokens.shot'),
          },
          alignment: {
            ast: path.join(snapshotPath, '5-AST-Alignment-AST.shot'),
            tokens: path.join(snapshotPath, '6-AST-Alignment-Tokens.shot'),
          },
        },
        error: {
          tsestree: path.join(snapshotPath, '1-TSESTree-Error.shot'),
          babel: path.join(snapshotPath, '2-Babel-Error.shot'),
          alignment: path.join(snapshotPath, '3-Alignment-Error.shot'),
        },
      },
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

      if (fixture.isError) {
        if (
          errorLabel === ErrorLabel.TSESTree ||
          errorLabel === ErrorLabel.Babel
        ) {
          fixturesWithErrorDifferences[errorLabel].add(fixture.relative);
        }

        it('TSESTree - Error', () => {
          expect(tsestreeParsed.error).toMatchSpecificSnapshot(
            fixture.snapshotFiles.error.tsestree,
          );
        });
        it('Babel - Error', () => {
          expect(babelParsed.error).toMatchSpecificSnapshot(
            fixture.snapshotFiles.error.babel,
          );
        });
        it('Error Alignment', () => {
          expect(errorLabel).toMatchSpecificSnapshot(
            fixture.snapshotFiles.error.alignment,
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
            fixture.snapshotFiles.success.tsestree.ast,
          );
        });
        it('TSESTree - Tokens', () => {
          expectSuccessResponse(tsestreeParsed);
          expect(tsestreeParsed.tokens).toMatchSpecificSnapshot(
            fixture.snapshotFiles.success.tsestree.tokens,
          );
        });

        it('Babel - AST', () => {
          expectSuccessResponse(babelParsed);
          expect(babelParsed.ast).toMatchSpecificSnapshot(
            fixture.snapshotFiles.success.babel.ast,
          );
        });
        it('Babel - Tokens', () => {
          expectSuccessResponse(babelParsed);
          expect(babelParsed.tokens).toMatchSpecificSnapshot(
            fixture.snapshotFiles.success.babel.tokens,
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
            fixture.snapshotFiles.success.alignment.ast,
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
            fixture.snapshotFiles.success.alignment.tokens,
          );

          if (diffHasChanges(diffResult)) {
            fixturesWithTokenDifferences.add(fixture.relative);
          }
        });

        it('Should parse with no errors', () => {
          // log the error for debug purposes in case there wasn't supposed to be an error
          switch (errorLabel) {
            case ErrorLabel.None:
              return;

            case ErrorLabel.Babel:
              expectErrorResponse(babelParsed);
              console.error('Babel:\n', babelParsed.error);
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

          // if this fails and you WERE expecting a parser error, then your fixture should be in the `_error_` subfolder
          // if this fails and you WEREN'T expecting a parser error - then something is broken.
          expect(errorLabel).toBe(ErrorLabel.None);
        });
      }
    };

    if ([...fixture.segments, fixture.name].join(path.sep) === ONLY) {
      // eslint-disable-next-line jest/no-focused-tests
      describe.only(fixture.name, test);
    } else {
      describe(fixture.name, test);
    }
  }
}

describe('AST Fixtures', () => {
  fixtures.forEach(f => nestDescribe(f));

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
});
