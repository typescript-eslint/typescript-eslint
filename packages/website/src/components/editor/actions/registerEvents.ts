import type * as Monaco from 'monaco-editor';

import { debounce } from '../../lib/debounce';
import type { PlaygroundSystem } from '../../linter/types';
import type { ErrorGroup } from '../../types';
import type { LintCodeAction } from './utils';
import {
  applyEdit,
  createEditAction,
  createURI,
  isCodeFile,
  normalizeMarkerCode,
  normalizeMarkerGroup,
  tryParseEslintModule,
} from './utils';

export function registerEvents(
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor,
  system: PlaygroundSystem,
  onValidate: (markers: ErrorGroup[]) => void,
  onCursorChange: (offset: number) => void,
  globalActions: Map<string, Map<string, LintCodeAction[]>>,
): Monaco.IDisposable {
  const updateMarkers = (uri: Monaco.Uri): void => {
    const model = monaco.editor.getModel(uri);
    if (!model?.isAttachedToEditor()) {
      return;
    }
    const markers = monaco.editor.getModelMarkers({
      resource: uri,
    });
    const fileActions = globalActions.get(uri.toString());

    const result: Record<string, ErrorGroup> = {};
    for (const marker of markers) {
      const group = normalizeMarkerGroup(marker);
      const { target, value } = normalizeMarkerCode(marker);

      const fixers =
        fileActions?.get(createURI(marker))?.map(item => ({
          message: item.message,
          isPreferred: item.isPreferred,
          fix(): void {
            applyEdit(model, editor, createEditAction(monaco, model, item.fix));
          },
        })) ?? [];

      if (!result[group]) {
        result[group] = {
          group,
          uri: target,
          items: [],
        };
      }

      result[group].items.push({
        message:
          (marker.owner !== 'eslint' ? `${value}: ` : '') + marker.message,
        location: `${marker.startLineNumber}:${marker.startColumn} - ${marker.endLineNumber}:${marker.endColumn}`,
        severity: marker.severity,
        fixer: fixers.find(item => item.isPreferred),
        suggestions: fixers.filter(item => !item.isPreferred),
      });
    }

    onValidate(
      Object.values(result).sort((a, b) => a.group.localeCompare(b.group)),
    );
  };

  const disposable = [
    editor.onDidChangeModelContent(event => {
      if (event.isFlush) {
        return;
      }
      const model = editor.getModel();
      if (model) {
        system.writeFile(model.uri.path, model.getValue() || '\n');
      }
    }),
    editor.onDidChangeModel(event => {
      if (event.newModelUrl) {
        updateMarkers(event.newModelUrl);
      }
    }),
    monaco.editor.onDidChangeMarkers(event => {
      const currentModelUri = editor.getModel()?.uri;
      if (!currentModelUri) {
        return;
      }

      event.forEach(uri => {
        updateMarkers(uri);
      });
    }),
    editor.onDidPaste(() => {
      const model = editor.getModel();
      if (!model) {
        return;
      }
      if (model.uri.path === '/.eslintrc') {
        const newValue = tryParseEslintModule(model.getValue());
        if (newValue) {
          applyEdit(model, editor, {
            range: model.getFullModelRange(),
            text: newValue,
          });
        }
      }
    }),
    editor.onDidChangeCursorPosition(
      debounce(e => {
        if (e.position) {
          const model = editor.getModel();
          if (model && isCodeFile(model.uri.path)) {
            console.info('[Editor] updating cursor', e.position);
            onCursorChange(model.getOffsetAt(e.position));
          }
        }
      }, 150),
    ),
  ];

  return {
    dispose(): void {
      disposable.forEach(item => item.dispose());
    },
  };
}
