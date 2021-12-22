import type { ASTViewerModel, Serializer, SelectedPosition } from '../types';
import type { SourceFile, Node } from 'typescript';
import { isRecord } from '../utils';

export function getLineAndCharacterFor(
  pos: number,
  ast: SourceFile,
): SelectedPosition {
  const loc = ast.getLineAndCharacterOfPosition(pos);
  return {
    line: loc.line + 1,
    column: loc.character,
  };
}

export const propsToFilter = [
  'parent',
  'jsDoc',
  'lineMap',
  'externalModuleIndicator',
  'bindDiagnostics',
  'transformFlags',
  'resolvedModules',
  'imports',
];

function isTsNode(value: unknown): value is Node {
  return isRecord(value) && typeof value.kind === 'number';
}

export function createTsSerializer(
  root: SourceFile,
  syntaxKind: Record<number, string>,
): Serializer {
  return function serializer(
    data,
    _key,
    processValue,
  ): ASTViewerModel | undefined {
    if (root && isTsNode(data)) {
      const nodeName = syntaxKind[data.kind];

      return {
        range: {
          start: getLineAndCharacterFor(data.pos, root),
          end: getLineAndCharacterFor(data.end, root),
        },
        type: 'object',
        name: nodeName,
        value: processValue(
          Object.entries(data).filter(item => !propsToFilter.includes(item[0])),
        ),
      };
    }
    return undefined;
  };
}
