import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceFile } from 'typescript';

import type { ConfigModel, ErrorGroup, SelectedRange, TabType } from '../types';

export interface CommonEditorProps extends ConfigModel {
  readonly activeTab: TabType;
  readonly selectedRange?: SelectedRange;
  readonly onChange: (cfg: Partial<ConfigModel>) => void;
  readonly onTsASTChange: (value: SourceFile | undefined) => void;
  readonly onEsASTChange: (value: TSESTree.Program | undefined) => void;
  readonly onScopeChange: (value: Record<string, unknown> | undefined) => void;
  readonly onMarkersChange: (value: ErrorGroup[]) => void;
  readonly onSelect: (position?: number) => void;
}
