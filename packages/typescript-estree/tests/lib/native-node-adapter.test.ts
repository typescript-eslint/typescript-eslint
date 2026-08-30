import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { astConverter } from '../../src/ast-converter';
import { createNativeProjectService } from '../../src/native';
import { createNativeNodeAdapter } from '../../src/native/nativeNodeAdapter';
import { createParseSettings } from '../../src/parseSettings/createParseSettings';
import { simpleTraverse } from '../../src/simple-traverse';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const fixturePath = path.join(fixtures, 'file.ts');
const fixture = fs.readFileSync(fixturePath, 'utf8');
const jsxFixturePath = path.join(fixtures, 'component.tsx');
const jsxFixture = fs.readFileSync(jsxFixturePath, 'utf8');
const baseOptions = {
  comment: true,
  jsx: true,
  loc: true,
  range: true,
  tokens: true,
} as const;

function convertClassic(code: string, filePath = fixturePath) {
  const options = { ...baseOptions, filePath };
  const settings = createParseSettings(code, options);
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
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
  it('is required before passing native nodes to the converter', () => {
    withNativeSourceFile(fixture, fixturePath, ({ sourceFile }) => {
      expect(() =>
        astConverter(
          sourceFile as unknown as ts.SourceFile,
          createParseSettings(fixture, {
            ...baseOptions,
            filePath: fixturePath,
          }),
          true,
        ),
      ).toThrow();
    });
  });

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

  it('produces the classic ESTree tree, tokens, and comments', () => {
    const classic = convertClassic(fixture);
    withNativeSourceFile(fixture, fixturePath, ({ sourceFile }) => {
      const adapter = createNativeNodeAdapter();
      const adaptedSourceFile = adapter.adaptSourceFile(sourceFile);
      const native = astConverter(
        adaptedSourceFile,
        createParseSettings(fixture, { ...baseOptions, filePath: fixturePath }),
        true,
      );

      expect(native.estree).toEqual(classic.estree);
      function verifyChildren(node: ts.Node): void {
        for (const child of node.getChildren()) {
          let unwrapped;
          try {
            unwrapped = adapter.unwrapNode(child);
          } catch (error) {
            expect(ts.isToken(child)).toBe(true);
            expect(error).toEqual(
              new Error(
                'The node was not created by this native node adapter.',
              ),
            );
            continue;
          }
          expect(adapter.wrapNode(unwrapped)).toBe(child);
          verifyChildren(child);
        }
      }
      verifyChildren(adaptedSourceFile);
      adaptedSourceFile.forEachChild(child => {
        expect(adapter.wrapNode(adapter.unwrapNode(child))).toBe(child);
      });
      simpleTraverse(native.estree, {
        enter: estreeNode => {
          if (native.astMaps.esTreeNodeToTSNodeMap.has(estreeNode)) {
            const node = native.astMaps.esTreeNodeToTSNodeMap.get(estreeNode);
            expect(adapter.wrapNode(adapter.unwrapNode(node))).toBe(node);
          }
        },
      });
    });
  });

  it('produces the classic ESTree tree, tokens, and comments for TSX', () => {
    const classic = convertClassic(jsxFixture, jsxFixturePath);
    withNativeSourceFile(jsxFixture, jsxFixturePath, ({ sourceFile }) => {
      const adapter = createNativeNodeAdapter();
      const native = astConverter(
        adapter.adaptSourceFile(sourceFile),
        createParseSettings(jsxFixture, {
          ...baseOptions,
          filePath: jsxFixturePath,
        }),
        true,
      );

      expect(native.estree).toEqual(classic.estree);
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
