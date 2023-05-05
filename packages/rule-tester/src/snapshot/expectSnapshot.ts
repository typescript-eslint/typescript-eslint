import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import zlib from 'node:zlib';

import makeDir from 'make-dir';

import type { TestFramework } from '../TestFramework';
import type { SingleTestResult, TestReportSuggestion } from './types';

/**
 * @param testFramework the test framework used by the RuleTester
 * @param pathInfo information about the path that snapshots might be written to
 * @param results the snapshot results collected from the tests
 */
export type RuleTesterExpectSnapshotFunction = (
  testFramework: typeof TestFramework,
  pathInfo: {
    /**
     * The base folder that snapshots should be written within
     */
    readonly snapshotBasePath: string;
    /**
     * The name of the rule being tested as provided to the `.run` method
     */
    readonly ruleName: string;
  },
  results: readonly SingleTestResult[],
) => void;

function hasErrorCode(e: unknown): e is { code: unknown } {
  return typeof e === 'object' && e != null && 'code' in e;
}

/**
 * Default snapshot tester which writes a single snapshot file for the test
 */
export const expectSnapshot: RuleTesterExpectSnapshotFunction = (
  testFramework,
  { snapshotBasePath, ruleName },
  results,
): void => {
  if (results.length === 0) {
    return;
  }

  const snapshotFolder = path.resolve(snapshotBasePath);
  try {
    makeDir.sync(snapshotFolder);
  } catch (e) {
    if (hasErrorCode(e) && e.code === 'EEXIST') {
      // already exists - ignored
    } else {
      throw e;
    }
  }
  const snapshotMdFilePath = path.join(
    snapshotFolder,
    `${ruleName}.snapshot.md`,
  );
  const snapshotMetaFilePath = path.join(
    snapshotFolder,
    `${ruleName}.snapshotstate`,
  );

  const existingSnapshotMeta = readSnapshotMeta(snapshotMetaFilePath);
  const updateSnapshots = testFramework.getShouldUpdateSnapshots();

  let passCount = 0;
  const newResults = new Set<SingleTestResult>();
  for (const result of results) {
    testFramework.it(result.testName, () => {
      const existingResult = existingSnapshotMeta[result.testHash];
      if (existingResult == null) {
        if (updateSnapshots === 'none') {
          assert.fail('No existing result for test');
        }

        assert.ok(true, 'No existing result for test');
        passCount += 1;
        newResults.add(result);
        return;
      }

      if (updateSnapshots === 'all') {
        assert.ok(true, 'All snapshots are being force-updated');
        passCount += 1;
        return;
      }

      // we could just do `assert.deepStrictEquals` here, but for better DevX we
      // don't want to expose users to our internal object representation, so
      // instead we granularly assert everything with clear

      assert.strictEqual(
        result.fixOutput,
        existingResult.fixOutput,
        'The fix output has changed.',
      );
      assert.strictEqual(
        result.errors.length,
        existingResult.errors.length,
        'The number of reported errors has changed.',
      );

      for (
        let errorIndex = 0;
        errorIndex < result.errors.length;
        errorIndex += 1
      ) {
        const error = result.errors[errorIndex];
        const existingError = existingResult.errors[errorIndex];
        assert.strictEqual(
          error.errorCodeFrame,
          existingError.errorCodeFrame,
          `The error at index ${errorIndex} has changed.`,
        );

        assert.strictEqual(
          error.suggestions?.length,
          existingError.suggestions?.length,
          'The number of reported suggestions has changed.',
        );

        if (error.suggestions != null && existingError.suggestions != null) {
          for (
            let suggestionIndex = 0;
            suggestionIndex < error.suggestions.length;
            suggestionIndex += 1
          ) {
            // TS can't resolve the type here for whatever reason
            const suggestion: TestReportSuggestion =
              error.suggestions[suggestionIndex];
            const existingSuggestion: TestReportSuggestion =
              existingError.suggestions[suggestionIndex];

            assert.strictEqual(
              suggestion.message,
              existingSuggestion.message,
              `The message of the suggestion at index ${errorIndex} has changed.`,
            );
            assert.strictEqual(
              suggestion.fixOutput,
              existingSuggestion.fixOutput,
              `The fix output of the suggestion at index ${errorIndex} has changed.`,
            );
          }
        }
      }

      passCount += 1;
    });
  }

  testFramework.afterAll(() => {
    if (passCount !== results.length || updateSnapshots === 'none') {
      return;
    }

    writeSnapshotMeta(
      snapshotMetaFilePath,
      Object.fromEntries(results.map(r => [r.testHash, r])),
    );
    writeMarkdown(ruleName, snapshotMdFilePath, results);
  });
};

type SnapshotMeta = Record<string, SingleTestResult>;
function readSnapshotMeta(metaPath: string): SnapshotMeta {
  try {
    const raw = fs.readFileSync(metaPath);
    const uncompressedBuf = zlib.gunzipSync(raw);
    return JSON.parse(uncompressedBuf.toString()) as SnapshotMeta;
  } catch {
    return {};
  }
}
function writeSnapshotMeta(metaPath: string, blob: SnapshotMeta): void {
  const buf = Buffer.from(JSON.stringify(blob));
  const compressed = zlib.gzipSync(buf);
  fs.writeFileSync(metaPath, compressed);
}
function writeMarkdown(
  ruleName: string,
  markdownPath: string,
  results: readonly SingleTestResult[],
): void {
  const markdownLines = [`# ${ruleName}`, ''];

  for (const result of results) {
    const codeFence = (code: string): string =>
      [
        '<!-- prettier-ignore -->',
        `\`\`\`${result.testLanguageFlavour}`,
        code,
        '```',
      ].join('\n');

    markdownLines.push(
      `## ${result.testName}`,
      '',
      '### Test Code',
      '',
      codeFence(result.code),
      '',
      '### Fix Output',
      '',
      result.fixOutput == null ? 'No fix applied' : codeFence(result.fixOutput),
      '',
      '### Errors',
      '',
    );

    for (const error of result.errors) {
      markdownLines.push(codeFence(error.errorCodeFrame), '');

      if (error.suggestions != null) {
        markdownLines.push('#### Suggestions', '');
        for (const suggestion of error.suggestions ?? []) {
          markdownLines.push(
            `##### ${suggestion.message}`,
            '',
            codeFence(suggestion.fixOutput),
          );
        }
      }
    }
  }

  // include a trailing newline
  markdownLines.push('');

  fs.writeFileSync(markdownPath, markdownLines.join('\n'), 'utf8');
}
