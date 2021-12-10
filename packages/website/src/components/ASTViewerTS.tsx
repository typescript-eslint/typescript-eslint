import React, { useCallback, useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import { isRecord } from './ast/utils';
import type {
  ASTViewerBaseProps,
  SelectedRange,
  SelectedPosition,
} from './ast/types';
import type { Node, SourceFile } from 'typescript';

export interface ASTTsViewerProps extends ASTViewerBaseProps {
  readonly version: string;
}

function extractEnum(
  obj: Record<number, string | number>,
): Record<number, string> {
  const result: Record<number, string> = {};
  const keys = Object.entries(obj);
  for (const [name, value] of keys) {
    if (typeof value === 'number') {
      if (!(value in result)) {
        result[value] = name;
      }
    }
  }
  return result;
}

function isTsNode(value: unknown): value is Node {
  return isRecord(value) && typeof value.kind === 'number';
}

function getFlagNamesFromEnum(
  allFlags: Record<number, string>,
  flags: number,
  prefix: string,
): string[] {
  return Object.entries(allFlags)
    .filter(([f, _]) => (Number(f) & flags) !== 0)
    .map(([_, name]) => `${prefix}.${name}`);
}

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

export function getLocFor(
  start: number,
  end: number,
  ast: SourceFile,
): SelectedRange {
  return {
    start: getLineAndCharacterFor(start, ast),
    end: getLineAndCharacterFor(end, ast),
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

export default function ASTViewerTS(props: ASTTsViewerProps): JSX.Element {
  const [syntaxKind, setSyntaxKind] = useState<Record<number, string>>({});
  const [nodeFlags, setNodeFlags] = useState<Record<number, string>>({});
  const [tokenFlags, setTokenFlags] = useState<Record<number, string>>({});
  const [modifierFlags, setModifierFlags] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    setSyntaxKind(extractEnum(window.ts.SyntaxKind));
    setNodeFlags(extractEnum(window.ts.NodeFlags));
    setTokenFlags(extractEnum(window.ts.TokenFlags));
    setModifierFlags(extractEnum(window.ts.ModifierFlags));
  }, [props.version]);

  const getTooltip = useCallback(
    (key: string, value: unknown): string | undefined => {
      if (key === 'flags' && typeof value === 'number') {
        return getFlagNamesFromEnum(nodeFlags, value, 'NodeFlags').join('\n');
      } else if (key === 'numericLiteralFlags' && typeof value === 'number') {
        return getFlagNamesFromEnum(tokenFlags, value, 'TokenFlags').join('\n');
      } else if (key === 'modifierFlagsCache' && typeof value === 'number') {
        return getFlagNamesFromEnum(modifierFlags, value, 'ModifierFlags').join(
          '\n',
        );
      } else if (key === 'kind' && typeof value === 'number') {
        return `SyntaxKind.${syntaxKind[value]}`;
      }
      return undefined;
    },
    [nodeFlags, tokenFlags, syntaxKind],
  );

  const getNodeName = useCallback(
    (value: unknown): string | undefined =>
      isTsNode(value) ? syntaxKind[value.kind] : undefined,
    [syntaxKind],
  );

  const filterProps = useCallback(
    (item: [string, unknown]): boolean =>
      !propsToFilter.includes(item[0]) &&
      !item[0].startsWith('_') &&
      item[1] !== undefined,
    [],
  );

  const getRange = useCallback(
    (value: unknown): SelectedRange | undefined => {
      if (props.value && isTsNode(value)) {
        return getLocFor(
          value.pos,
          value.end,
          // @ts-expect-error: unsafe cast
          props.value as SourceFile,
        );
      }
      return undefined;
    },
    [props.value],
  );

  return (
    <ASTViewer
      filterProps={filterProps}
      getRange={getRange}
      getTooltip={getTooltip}
      getNodeName={getNodeName}
      {...props}
    />
  );
}
