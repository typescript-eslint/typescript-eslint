import { AST_NODE_TYPES } from '@typescript-eslint/types';
import fs from 'node:fs';
import path from 'node:path';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { parseAndGenerateServices } from '../../src/index.js';
import { isolateNativeBackend, nativeFixtures } from './nativeTestUtils';

const filePath = path.join(nativeFixtures, 'instantiation.ts');

isolateNativeBackend();

/** Read from disk: the classic backend serves it from a shared program. */
function objectFlagsOfInstantiation(native: boolean) {
  const { ast, services } = parseAndGenerateServices(
    fs.readFileSync(filePath, 'utf8'),
    {
      filePath,
      tsconfigRootDir: nativeFixtures,
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
