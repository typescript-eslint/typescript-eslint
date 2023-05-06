import * as crypto from 'node:crypto';
import * as path from 'node:path';

import type { SourceLocation as BabelSourceLocation } from '@babel/code-frame';
import { codeFrameColumns } from '@babel/code-frame';
import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import type { InvalidTestCase } from '../types/InvalidTestCase';
import * as SourceCodeFixer from '../utils/SourceCodeFixer';
import type { SingleTestResult, TestReportError } from './types';

function renderError(code: string, error: Linter.LintMessage): string {
  const location: BabelSourceLocation = {
    start: {
      line: error.line,
      column: error.column,
    },
  };

  if (
    typeof error.endLine === 'number' &&
    typeof error.endColumn === 'number'
  ) {
    location.end = {
      line: error.endLine,
      column: error.endColumn,
    };
  }

  return codeFrameColumns(code, location, {
    forceColor: false,
    highlightCode: false,
    linesAbove: Number.POSITIVE_INFINITY,
    linesBelow: Number.POSITIVE_INFINITY,
    message: error.message,
  });
}

export function prepareErrorsForSnapshot(
  testName: string,
  testFilename: string,
  test: InvalidTestCase<string, readonly unknown[]>,
  output: string | null,
  messages: Linter.LintMessage[],
): SingleTestResult {
  const errors: TestReportError[] = [];
  for (const message of messages) {
    errors.push({
      errorCodeFrame: renderError(test.code, message),
      suggestions:
        message.suggestions == null
          ? null
          : message.suggestions.map(s => ({
              message: s.desc,
              fixOutput: SourceCodeFixer.applyFixes(test.code, [s]).output,
            })),
    });
  }

  const testFilenameExtension = path.extname(testFilename).substring(1);

  const testHash = (() => {
    const {
      errors: _errors,
      dependencyConstraints: _dependencyConstraints,
      only: _only,
      skip: _skip,
      output: _output,
      ...hashableProps
    } = test;
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(hashableProps))
      .digest('base64');
  })();

  return {
    code: test.code,
    errors,
    fixOutput: output,
    testLanguageFlavour:
      testFilenameExtension === '' ? 'ts' : testFilenameExtension,
    testName,
    testHash,
  };
}
