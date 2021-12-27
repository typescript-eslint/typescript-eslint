import type { ASTViewerModel, Serializer, SelectedPosition } from '../types';
import type { SourceFile, Node, Type, Symbol as TSSymbol } from 'typescript';
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
  'nextContainer',
  'jsDoc',
  'jsDocComment',
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

function isTsType(value: unknown): value is Type {
  return isRecord(value) && value.getBaseTypes != null;
}

function isTsSymbol(value: unknown): value is TSSymbol {
  return isRecord(value) && value.getDeclarations != null;
}

export function createTsSerializer(
  root: SourceFile,
  syntaxKind: Record<number, string>,
): Serializer {
  const SEEN_THINGS = new WeakMap<Record<string, unknown>, ASTViewerModel>();

  return function serializer(
    data,
    key,
    processValue,
  ): ASTViewerModel | undefined {
    if (root) {
      if (isTsNode(data)) {
        if (SEEN_THINGS.has(data)) {
          return SEEN_THINGS.get(data);
        }

        const nodeName = syntaxKind[data.kind];

        const result: ASTViewerModel = {
          range: {
            start: getLineAndCharacterFor(data.pos, root),
            end: getLineAndCharacterFor(data.end, root),
          },
          type: 'object',
          name: nodeName,
          value: [],
        };

        SEEN_THINGS.set(data, result);

        result.value = processValue(
          Object.entries(data).filter(item => !propsToFilter.includes(item[0])),
        );
        return result;
      }
      const tsType = isTsType(data);
      const tsSymbol = isTsSymbol(data);
      if (tsType || tsSymbol || key === 'flowNode') {
        return {
          type: 'object',
          name: tsSymbol ? '[Symbol]' : tsType ? '[Type]' : '[FlowNode]',
          value: processValue(
            Object.entries(data).filter(
              item => !propsToFilter.includes(item[0]),
            ),
          ),
        };
      }
    }
    return undefined;
  };
}
