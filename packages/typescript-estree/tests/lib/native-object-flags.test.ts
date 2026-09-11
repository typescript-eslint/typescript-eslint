import { AST_NODE_TYPES } from '@typescript-eslint/types';
import fs from 'node:fs';
import path from 'node:path';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'instantiation.ts');

beforeEach(() => {
  // This test selects a backend per call, so the blanket environment switch
  // has to stay out of the way.
  vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_BACKEND', 'false');
});

afterEach(clearCaches);

/**
 * The two compilers number `ObjectFlags` above `Mapped` differently. Classic's
 * `InstantiationExpressionType` is native's `IsGenericObjectType`, so passing
 * the flags through unchanged would make `no-misused-spread` miss real
 * instantiation expressions and fire on ordinary generic object types.
 *
 * The fixture is read from disk rather than written inline because the classic
 * backend serves the file from a shared program, which other tests may have
 * already populated from disk.
 */
function objectFlagsOfInstantiation(native: boolean) {
  const { ast, services } = parseAndGenerateServices(
    fs.readFileSync(filePath, 'utf8'),
    {
      filePath,
      tsconfigRootDir: fixtures,
      ...(native
        ? { projectService: { backend: 'native' as const } }
        : { projectService: true }),
    },
  );
  assert.isNotNull(services.program);
  const checker = services.program.getTypeChecker();

  const declarator = ast.body
    .flatMap(statement => {
      const declaration =
        statement.type === AST_NODE_TYPES.ExportNamedDeclaration
          ? statement.declaration
          : statement;
      return declaration?.type === AST_NODE_TYPES.VariableDeclaration
        ? declaration.declarations
        : [];
    })
    .at(-1);
  if (!declarator) {
    throw new Error('The fixture should declare an exported variable.');
  }
  const type = checker.getTypeAtLocation(
    services.esTreeNodeToTSNodeMap.get(declarator),
  );

  return {
    isInstantiationExpression:
      tsutils.isObjectType(type) &&
      tsutils.isObjectFlagSet(type, ts.ObjectFlags.InstantiationExpressionType),
    objectFlags: tsutils.isObjectType(type) ? type.objectFlags : undefined,
  };
}

it('reports classic object flags for an instantiation expression', () => {
  expect(objectFlagsOfInstantiation(true)).toStrictEqual(
    objectFlagsOfInstantiation(false),
  );
});

it('recognizes an instantiation expression on the native backend', () => {
  expect(objectFlagsOfInstantiation(true).isInstantiationExpression).toBe(true);
});
