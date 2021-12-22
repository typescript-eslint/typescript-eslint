import React, { useCallback, useEffect, useState } from 'react';

import ASTViewer from './ast/ASTViewer';
import type { ASTViewerBaseProps, ASTViewerModelMap } from './ast/types';
import type { SourceFile } from 'typescript';
import { serialize } from './ast/serializer/serializer';
import { createTsSerializer } from './ast/serializer/serializerTS';

export interface ASTTsViewerProps extends ASTViewerBaseProps {
  readonly value: SourceFile | string;
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

export default function ASTViewerTS({
  value,
  position,
  onSelectNode,
}: ASTTsViewerProps): JSX.Element {
  const [model, setModel] = useState<string | ASTViewerModelMap>('');
  const [syntaxKind] = useState(() => extractEnum(window.ts.SyntaxKind));
  const [nodeFlags] = useState(() => extractEnum(window.ts.NodeFlags));
  const [tokenFlags] = useState(() => extractEnum(window.ts.TokenFlags));
  const [modifierFlags] = useState(() => extractEnum(window.ts.ModifierFlags));

  useEffect(() => {
    if (typeof value === 'string') {
      setModel(value);
    } else {
      const scopeSerializer = createTsSerializer(value, syntaxKind);
      setModel(serialize(value, scopeSerializer));
    }
  }, [value, syntaxKind]);

  // TODO: move this to serializer
  const getTooltip = useCallback(
    (data: ASTViewerModelMap): string | undefined => {
      if (data.model.type === 'number') {
        switch (data.key) {
          case 'flags':
            return getFlagNamesFromEnum(
              nodeFlags,
              Number(data.model.value),
              'NodeFlags',
            ).join('\n');
          case 'numericLiteralFlags':
            return getFlagNamesFromEnum(
              tokenFlags,
              Number(data.model.value),
              'TokenFlags',
            ).join('\n');
          case 'modifierFlagsCache':
            return getFlagNamesFromEnum(
              modifierFlags,
              Number(data.model.value),
              'ModifierFlags',
            ).join('\n');
          case 'kind':
            return `SyntaxKind.${syntaxKind[Number(data.model.value)]}`;
        }
      }
      return undefined;
    },
    [nodeFlags, tokenFlags, syntaxKind],
  );

  return (
    <ASTViewer
      getTooltip={getTooltip}
      position={position}
      onSelectNode={onSelectNode}
      value={model}
    />
  );
}
