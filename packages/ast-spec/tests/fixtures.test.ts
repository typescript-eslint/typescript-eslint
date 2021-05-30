import fs from 'fs';
import glob from 'glob';
import makeDir from 'make-dir';
import path from 'path';
import { parseBabel } from './util/parsers/babel';
import { Fixture } from './util/parsers/parser-types';
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

const fixtures: readonly Fixture[] = glob
  .sync(`${SRC_DIR}/**/fixtures/*/*.{ts,tsx}`)
  .map(absolute => {
    const relativeToSrc = path.relative(SRC_DIR, absolute);
    const { dir, ext } = path.parse(relativeToSrc);
    const segments = dir.split(path.sep).filter(s => s !== 'fixtures');
    const name = segments.pop()!;
    const snapshotPath = path.join(SRC_DIR, dir, 'snapshots');
    return {
      absolute,
      name,
      ext,
      isJSX: ext.endsWith('x'),
      relative: path.relative(PACKAGE_ROOT, absolute),
      segments,
      snapshotPath,
      snapshotFiles: {
        tsestree: {
          ast: path.join(snapshotPath, '1-TSESTree-AST.shot'),
          tokens: path.join(snapshotPath, '2-TSESTree-Tokens.shot'),
          error: path.join(snapshotPath, '3-TSESTree-Error.shot'),
        },
        babel: {
          ast: path.join(snapshotPath, '4-Babel-AST.shot'),
          tokens: path.join(snapshotPath, '5-Babel-Tokens.shot'),
          error: path.join(snapshotPath, '6-Babel-Error.shot'),
        },
        alignment: {
          ast: path.join(snapshotPath, '7-AST-Alignment-AST.shot'),
          tokens: path.join(snapshotPath, '8-AST-Alignment-Tokens.shot'),
          error: path.join(snapshotPath, '9-AST-Alignment-Error.shot'),
        },
      },
    };
  });

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
        if ('code' in e && e.code === 'EEXIST') {
          // already exists - ignored
        } else {
          throw e;
        }
      }

      const tsestreeParsed = parseTSESTree(fixture, contents);
      it('TSESTree - AST', () => {
        expect(tsestreeParsed.ast).toMatchSpecificSnapshot(
          fixture.snapshotFiles.tsestree.ast,
        );
      });
      it('TSESTree - Tokens', () => {
        expect(tsestreeParsed.tokens).toMatchSpecificSnapshot(
          fixture.snapshotFiles.tsestree.tokens,
        );
      });
      it('TSESTree - Error', () => {
        expect(tsestreeParsed.error).toMatchSpecificSnapshot(
          fixture.snapshotFiles.tsestree.error,
        );
      });

      const babelParsed = parseBabel(fixture, contents);
      it('Babel - AST', () => {
        expect(babelParsed.ast).toMatchSpecificSnapshot(
          fixture.snapshotFiles.babel.ast,
        );
      });
      it('Babel - Tokens', () => {
        expect(babelParsed.tokens).toMatchSpecificSnapshot(
          fixture.snapshotFiles.babel.tokens,
        );
      });
      it('Babel - Error', () => {
        expect(babelParsed.error).toMatchSpecificSnapshot(
          fixture.snapshotFiles.babel.error,
        );
      });

      it('AST Alignment - AST', () => {
        const diffResult = snapshotDiff(
          'TSESTree',
          tsestreeParsed.ast,
          'Babel',
          babelParsed.ast,
        );
        expect(diffResult).toMatchSpecificSnapshot(
          fixture.snapshotFiles.alignment.ast,
        );

        if (diffHasChanges(diffResult)) {
          fixturesWithASTDifferences.add(fixture.relative);
        }
      });
      it('AST Alignment - Token', () => {
        const diffResult = snapshotDiff(
          'TSESTree',
          tsestreeParsed.tokens,
          'Babel',
          babelParsed.tokens,
        );
        expect(diffResult).toMatchSpecificSnapshot(
          fixture.snapshotFiles.alignment.tokens,
        );

        if (diffHasChanges(diffResult)) {
          fixturesWithTokenDifferences.add(fixture.relative);
        }
      });
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
});
