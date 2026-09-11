import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { astConverter } from '../../src/ast-converter';
import { createNativeProjectService } from '../../src/native';
import { createNativeNodeAdapter } from '../../src/native/nativeNodeAdapter';
import { createParseSettings } from '../../src/parseSettings/createParseSettings';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const fixturePath = path.join(fixtures, 'file.ts');
const fixture = fs.readFileSync(fixturePath, 'utf8');
const baseOptions = {
  comment: true,
  loc: true,
  range: true,
  tokens: true,
} as const;

function convertClassic(code: string) {
  const settings = createParseSettings(code, {
    ...baseOptions,
    filePath: fixturePath,
  });
  const sourceFile = ts.createSourceFile(
    fixturePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  return astConverter(sourceFile, settings, true);
}

function withNativeSourceFile<T>(
  code: string,
  filePath: string,
  callback: (
    context: ReturnType<
      ReturnType<typeof createNativeProjectService>['openFile']
    >,
  ) => T,
): T {
  const service = createNativeProjectService();
  try {
    return callback(service.openFile(filePath, code));
  } finally {
    service.close();
  }
}

describe('native node adapter', () => {
  it('caches adapted node arrays and their structural children', () => {
    withNativeSourceFile(fixture, fixturePath, ({ sourceFile }) => {
      const adapter = createNativeNodeAdapter();
      const adaptedSourceFile = adapter.adaptSourceFile(sourceFile);
      const statements = adaptedSourceFile.statements;

      expect(adaptedSourceFile.statements).toBe(statements);
      expect(adapter.wrapNode(adapter.unwrapNode(statements[0]))).toBe(
        statements[0],
      );
    });
  });

  it('preserves converter behavior for a syntax error', () => {
    const invalid = `${fixture}\nconst value = ;`;
    let classicError: unknown;
    try {
      convertClassic(invalid);
    } catch (error) {
      classicError = error;
    }

    withNativeSourceFile(invalid, fixturePath, ({ program, sourceFile }) => {
      const adapter = createNativeNodeAdapter(() =>
        program.getSyntacticDiagnostics(fixturePath),
      );
      expect(() =>
        astConverter(
          adapter.adaptSourceFile(sourceFile),
          createParseSettings(invalid, {
            ...baseOptions,
            filePath: fixturePath,
          }),
          true,
        ),
      ).toThrow(classicError);
    });
  });
});
