import type { TSESTree } from '@typescript-eslint/utils';
import type Monaco from 'monaco-editor';
import type { SourceFile } from 'typescript';

import type { ConfigModel, ErrorGroup, SelectedRange, TabType } from '../types';

export interface CommonEditorProps extends ConfigModel {
  readonly activeTab: TabType;
  readonly decoration: SelectedRange | null;
  readonly onChange: (cfg: Partial<ConfigModel>) => void;
  readonly onTsASTChange: (value: undefined | SourceFile) => void;
  readonly onEsASTChange: (value: undefined | TSESTree.Program) => void;
  readonly onScopeChange: (value: undefined | Record<string, unknown>) => void;
  readonly onMarkersChange: (value: ErrorGroup[] | Error) => void;
  readonly onSelect: (position: Monaco.Position | null) => void;
}
