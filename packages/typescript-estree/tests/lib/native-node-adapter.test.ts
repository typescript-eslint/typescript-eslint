import fs from 'node:fs';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { astConverter } from '../../src/ast-converter';
import { createNativeProjectService } from '../../src/native';
import { createNativeNodeAdapter } from '../../src/native/nativeNodeAdapter';
import { createParseSettings } from '../../src/parseSettings/createParseSettings';
import {
  nativeFilePath as fixturePath,
  nativeFixtures,
  nativePath,
} from './nativeTestUtils';

const fixture = fs.readFileSync(fixturePath, 'utf8');
const tsxFixturePath = nativePath(nativeFixtures, 'component.tsx');
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

type NativeContext = ReturnType<
  ReturnType<typeof createNativeProjectService>['openFile']
>;

function withNativeSourceFile<T>(
  code: string,
  filePath: string,
  callback: (context: NativeContext) => T,
): T {
  const service = createNativeProjectService();
  try {
    return callback(service.openFile(filePath, code));
  } finally {
    service.close();
  }
}

function createAdapter(program: NativeContext['program']) {
  return createNativeNodeAdapter({
    getSourceFile: fileName => program.getSourceFile(fileName),
    getSyntacticDiagnostics: fileName =>
      program.getSyntacticDiagnostics(fileName),
  });
}

function findNode(root: ts.Node, kind: ts.SyntaxKind): ts.Node {
  let found: ts.Node | undefined;
  const visit = (node: ts.Node): void => {
    if (found) {
      return;
    }
    if (node.kind === kind) {
      found = node;
      return;
    }
    node.forEachChild(visit);
  };
  visit(root);
  if (!found) {
    throw new Error(`Expected a ${ts.SyntaxKind[kind]} node.`);
  }
  return found;
}

describe('native node adapter', () => {
  it('caches adapted node arrays and their structural children', () => {
    withNativeSourceFile(fixture, fixturePath, ({ program, sourceFile }) => {
      const adapter = createAdapter(program);
      const adaptedSourceFile = adapter.wrapNode(sourceFile) as ts.SourceFile;
      const statements = adaptedSourceFile.statements;

      expect(adaptedSourceFile.statements).toBe(statements);
      expect(adapter.wrapNode(adapter.unwrapNode(statements[0]))).toBe(
        statements[0],
      );
    });
  });

  it('presents classic property names to in checks and key enumeration', () => {
    const code = 'declare function f<T extends object = {}>(value?: T): void;';
    withNativeSourceFile(code, fixturePath, ({ program, sourceFile }) => {
      const adapter = createAdapter(program);
      const adapted = adapter.wrapNode(sourceFile) as ts.SourceFile;
      const typeParameter = findNode(
        adapted,
        ts.SyntaxKind.TypeParameter,
      ) as ts.TypeParameterDeclaration;
      const parameter = findNode(
        adapted,
        ts.SyntaxKind.Parameter,
      ) as ts.ParameterDeclaration;

      expect('default' in typeParameter).toBe(true);
      expect('defaultType' in typeParameter).toBe(false);
      expect('questionToken' in parameter).toBe(true);
      expect('escapedText' in typeParameter.name).toBe(true);
      expect(Object.keys(typeParameter)).toEqual(
        expect.arrayContaining(['constraint', 'default', 'kind', 'name']),
      );
      expect(Object.keys(typeParameter)).not.toContain('defaultType');
      expect(Object.entries(typeParameter)).toContainEqual([
        'default',
        typeParameter.default,
      ]);
    });
  });

  it('answers checker queries for the split JSX closing tag tokens', () => {
    const code = 'const element = <div></div>;';
    withNativeSourceFile(code, tsxFixturePath, ({ program, sourceFile }) => {
      const adapter = createAdapter(program);
      const closing = findNode(
        adapter.wrapNode(sourceFile),
        ts.SyntaxKind.JsxClosingElement,
      );
      const [lessThan, slash] = closing.getChildren();

      expect(lessThan.kind).toBe(ts.SyntaxKind.LessThanToken);
      expect(slash.kind).toBe(ts.SyntaxKind.SlashToken);
      expect(adapter.unwrapNode(lessThan)).toBe(adapter.unwrapNode(slash));
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
      const adapter = createAdapter(program);
      expect(() =>
        astConverter(
          adapter.wrapNode(sourceFile) as ts.SourceFile,
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
