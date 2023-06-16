import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceFile } from 'typescript';

import type { ConfigModel, ErrorGroup, SelectedRange, TabType } from '../types';

export interface CommonEditorProps extends ConfigModel {
  readonly activeTab: TabType;
  readonly selectedRange?: SelectedRange;
  readonly onChange: (cfg: Partial<ConfigModel>) => void;
  readonly onTsASTChange: (value: undefined | SourceFile) => void;
  readonly onEsASTChange: (value: undefined | TSESTree.Program) => void;
  readonly onScopeChange: (value: undefined | Record<string, unknown>) => void;
  readonly onMarkersChange: (value: ErrorGroup[]) => void;
  readonly onSelect: (position?: number) => void;
}
