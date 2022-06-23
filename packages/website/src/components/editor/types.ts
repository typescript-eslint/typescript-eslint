import type Monaco from 'monaco-editor';
import type { ConfigModel, SelectedRange, ErrorGroup, TabType } from '../types';
import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceFile } from 'typescript';

export interface CommonEditorProps extends ConfigModel {
  readonly darkTheme: boolean;
  readonly activeTab: TabType;
  readonly decoration: SelectedRange | null;
  readonly onChange: (cfg: Partial<ConfigModel>) => void;
  readonly onTsASTChange: (value: undefined | SourceFile) => void;
  readonly onEsASTChange: (value: undefined | TSESTree.Program) => void;
  readonly onScopeChange: (value: undefined | Record<string, unknown>) => void;
  readonly onMarkersChange: (value: ErrorGroup[]) => void;
  readonly onSelect: (position: Monaco.Position | null) => void;
}
