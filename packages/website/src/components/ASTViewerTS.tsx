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
import { ASTViewerModelSimple } from './ast/types';

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
    (data: ASTViewerModelSimple): string | undefined => {
      if (data.type === 'number') {
        switch (data.key) {
          case 'flags':
            return getFlagNamesFromEnum(
              nodeFlags,
              Number(data.value),
              'NodeFlags',
            ).join('\n');
          case 'numericLiteralFlags':
            return getFlagNamesFromEnum(
              tokenFlags,
              Number(data.value),
              'TokenFlags',
            ).join('\n');
          case 'modifierFlagsCache':
            return getFlagNamesFromEnum(
              modifierFlags,
              Number(data.value),
              'ModifierFlags',
            ).join('\n');
          case 'kind':
            return `SyntaxKind.${syntaxKind[Number(data.value)]}`;
        }
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
