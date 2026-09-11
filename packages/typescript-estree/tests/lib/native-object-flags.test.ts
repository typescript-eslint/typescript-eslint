import path from 'node:path';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'file.ts');

afterEach(clearCaches);

const CODE = [
  'declare const g: <T extends object>(t: T) => void;',
  'const inst = g<{ x: 1 }>;',
].join('\n');

/**
 * The two compilers number `ObjectFlags` above `Mapped` differently. Classic's
 * `InstantiationExpressionType` is native's `IsGenericObjectType`, so passing
 * the flags through unchanged would make `no-misused-spread` miss real
 * instantiation expressions and fire on ordinary generic object types.
 */
function objectFlagsOfInstantiation(native: boolean) {
  const { ast, services } = parseAndGenerateServices(CODE, {
    filePath,
    ...(native
      ? { projectService: { backend: 'native' as const } }
      : { project: './tsconfig.json', tsconfigRootDir: fixtures }),
  });
  const checker = services.program.getTypeChecker();
  const declaration = ast.body[1] as never as { declarations: { id: never }[] };
  const type = checker.getTypeAtLocation(
    services.esTreeNodeToTSNodeMap.get(declaration.declarations[0].id),
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
