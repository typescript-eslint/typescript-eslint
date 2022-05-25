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
  'setExternalModuleIndicator',
  'bindDiagnostics',
  'transformFlags',
  'resolvedModules',
  'imports',
  'antecedent',
  'antecedents',
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

function expandFlags(
  allFlags: [string, Record<number, string>],
  flags: number,
): string {
  return Object.entries(allFlags[1])
    .filter(([f, _]) => (Number(f) & flags) !== 0)
    .map(([_, name]) => `${allFlags[0]}.${name}`)
    .join('\n');
}

function prepareValue(data: Record<string, unknown>): [string, unknown][] {
  return Object.entries(data).filter(item => !propsToFilter.includes(item[0]));
}

export function createTsSerializer(
  root: SourceFile,
  syntaxKind: Record<number, string>,
  nodeFlags: [string, Record<number, string>],
  tokenFlags: [string, Record<number, string>],
  modifierFlags: [string, Record<number, string>],
  objectFlags: [string, Record<number, string>],
  symbolFlags: [string, Record<number, string>],
  flowFlags: [string, Record<number, string>],
  typeFlags: [string, Record<number, string>],
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

        result.value = processValue(prepareValue(data), item => {
          if (item.model.type === 'number') {
            switch (item.key) {
              case 'flags':
                return expandFlags(nodeFlags, Number(item.model.value));
              case 'numericLiteralFlags':
                return expandFlags(tokenFlags, Number(item.model.value));
              case 'modifierFlagsCache':
                return expandFlags(modifierFlags, Number(item.model.value));
              case 'kind':
                return `SyntaxKind.${syntaxKind[Number(item.model.value)]}`;
            }
          }
          return undefined;
        });
        return result;
      } else if (isTsType(data)) {
        return {
          type: 'object',
          name: '[Type]',
          value: processValue(prepareValue(data), item => {
            if (item.model.type === 'number') {
              if (item.key === 'objectFlags') {
                return expandFlags(objectFlags, Number(item.model.value));
              } else if (item.key === 'flags') {
                return expandFlags(typeFlags, Number(item.model.value));
              }
            }
            return undefined;
          }),
        };
      } else if (isTsSymbol(data)) {
        return {
          type: 'object',
          name: '[Symbol]',
          value: processValue(prepareValue(data), item => {
            if (item.model.type === 'number' && item.key === 'flags') {
              return expandFlags(symbolFlags, Number(item.model.value));
            }
            return undefined;
          }),
        };
      } else if (key === 'flowNode' || key === 'endFlowNode') {
        return {
          type: 'object',
          name: '[FlowNode]',
          value: processValue(prepareValue(data), item => {
            if (item.model.type === 'number' && item.key === 'flags') {
              return expandFlags(flowFlags, Number(item.model.value));
            }
            return undefined;
          }),
        };
      }
    }
    return undefined;
  };
}
