import type { UpdateModel } from '../linter/types';
import type { ConfigModel, ErrorGroup, SelectedRange, TabType } from '../types';

export interface CommonEditorProps extends ConfigModel {
  readonly activeTab: TabType;
  readonly onASTChange: (value: UpdateModel | undefined) => void;
  readonly onChange: (cfg: Partial<ConfigModel>) => void;
  readonly onMarkersChange: (value: ErrorGroup[]) => void;
  readonly onSelect: (position?: number) => void;
  readonly selectedRange?: SelectedRange;
}
