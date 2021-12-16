import React, { useCallback, useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type {
  ASTViewerBaseProps,
  ASTViewerModel,
  SelectedRange,
  SelectedPosition,
} from './ast/types';
import type { SourceFile } from 'typescript';
import { serialize } from './ast/serializer/serializer';
import { createTsSerializer } from './ast/serializer/serializerTS';

export interface ASTTsViewerProps extends ASTViewerBaseProps {
  readonly version: string;
  readonly value: Record<string, unknown> | string;
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

export default function ASTViewerTS(props: ASTTsViewerProps): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModel>('');
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

  useEffect(() => {
    if (typeof props.value === 'string') {
      setModel(props.value);
    } else {
      const scopeSerializer = createTsSerializer(
        // @ts-expect-error: unsafe cast
        props.value as SourceFile,
        syntaxKind,
      );
      setModel(serialize(props.value, scopeSerializer));
    }
  }, [props.value, syntaxKind]);

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

  return (
    <ASTViewer
      getTooltip={getTooltip}
      position={props.position}
      onSelectNode={props.onSelectNode}
      value={model}
    />
  );
}
