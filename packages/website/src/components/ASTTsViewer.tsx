import React, { useEffect, useState } from 'react';

import ASTViewer, { ASTViewerBaseProps } from './ast/ASTViewer';
import { isRecord } from './ast/utils';

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

function getFlagNamesFromEnum(
  allFlags: Record<number, string>,
  flags: number,
  prefix: string,
): string[] {
  return Object.entries(allFlags)
    .filter(([f, _]) => (Number(f) & flags) !== 0)
    .map(([_, name]) => `${prefix}.${name}`);
}

export default function ASTTsViewer(props: ASTTsViewerProps): JSX.Element {
  const [syntaxKind, setSyntaxKind] = useState<Record<number, string>>({});
  const [nodeFlags, setNodeFlags] = useState<Record<number, string>>({});
  const [tokenFlags, setTokenFlags] = useState<Record<number, string>>({});

  useEffect(() => {
    setSyntaxKind(extractEnum(window.ts.SyntaxKind));
    setNodeFlags(extractEnum(window.ts.NodeFlags));
    setTokenFlags(extractEnum(window.ts.TokenFlags));
  }, [props.version]);

  return (
    <ASTViewer
      formatValue={(key, value): string | undefined => {
        if (key === 'flags' && typeof value === 'number') {
          return getFlagNamesFromEnum(nodeFlags, value, 'NodeFlags').join('\n');
        } else if (key === 'numericLiteralFlags' && typeof value === 'number') {
          return getFlagNamesFromEnum(tokenFlags, value, 'TokenFlags').join(
            '\n',
          );
        } else if (key === 'kind' && typeof value === 'number') {
          return `SyntaxKind.${syntaxKind[value]}`;
        }
        return undefined;
      }}
      getTypeName={(value): string | undefined =>
        isRecord(value) && typeof value.kind === 'number'
          ? syntaxKind[value.kind]
          : undefined
      }
      ast={props.ast}
    />
  );
}
