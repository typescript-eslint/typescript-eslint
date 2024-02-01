// The following code is adapted from the code in microsoft/TypeScript-Website.
// Source: https://github.com/microsoft/TypeScript-Website/blob/c8b2ea8c8fc216c163fe293650b2666c8563a67d/packages/playground/src/twoslashInlays.ts
// License: https://github.com/microsoft/TypeScript-Website/blob/c8b2ea8c8fc216c163fe293650b2666c8563a67d/LICENSE-CODE

import type Monaco from 'monaco-editor';
import type * as ts from 'typescript';

import type { SandboxInstance } from './useSandboxServices';

function findTwoshashQueries(code: string): RegExpExecArray[] {
  let match: RegExpExecArray | null = null;
  const matches: RegExpExecArray[] = [];
  // RegExp that matches '^<spaces>//?<spaces>$'
  while ((match = /^(\s*\/\/\s*\^\?)\s*$/gm.exec(code))) {
    matches.push(match);
  }
  return matches;
}

export function createTwoslashInlayProvider(
  sandbox: SandboxInstance,
): Monaco.languages.InlayHintsProvider {
  return {
    provideInlayHints: async (
      model,
      _,
      cancel,
    ): Promise<Monaco.languages.InlayHintList> => {
      const worker = await sandbox.getWorkerProcess();
      if (model.isDisposed() || cancel.isCancellationRequested) {
        return {
          hints: [],
          dispose(): void {
            /* nop */
          },
        };
      }

      const queryMatches = findTwoshashQueries(model.getValue());

      const results: Monaco.languages.InlayHint[] = [];

      for (const result of await Promise.all(
        queryMatches.map(q => resolveInlayHint(q)),
      )) {
        if (result) {
          results.push(result);
        }
      }

      return {
        hints: results,
        dispose(): void {
          /* nop */
        },
      };

      async function resolveInlayHint(
        queryMatch: RegExpExecArray,
      ): Promise<Monaco.languages.InlayHint | undefined> {
        const end = queryMatch.index + queryMatch[1].length - 1;
        const endPos = model.getPositionAt(end);
        const inspectionPos = new sandbox.monaco.Position(
          endPos.lineNumber - 1,
          endPos.column,
        );
        const inspectionOff = model.getOffsetAt(inspectionPos);

        const hint = await (worker.getQuickInfoAtPosition(
          'file://' + model.uri.path,
          inspectionOff,
        ) as Promise<ts.QuickInfo | undefined>);
        if (!hint?.displayParts) {
          return;
        }

        let text = hint.displayParts
          .map(d => d.text)
          .join('')
          .replace(/\r?\n\s*/g, ' ');
        if (text.length > 120) {
          text = text.slice(0, 119) + '...';
        }

        const inlay: Monaco.languages.InlayHint = {
          kind: sandbox.monaco.languages.InlayHintKind.Type,
          position: new sandbox.monaco.Position(
            endPos.lineNumber,
            endPos.column + 1,
          ),
          label: text,
          paddingLeft: true,
        };

        return inlay;
      }
    },
  };
}
