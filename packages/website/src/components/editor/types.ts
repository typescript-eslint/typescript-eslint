import type { UpdateModel } from '../linter/types';
import type { ConfigModel, ErrorGroup, SelectedRange, TabType } from '../types';

export interface CommonEditorProps extends ConfigModel {
  readonly activeTab: TabType;
  readonly selectedRange?: SelectedRange;
  readonly onChange: (cfg: Partial<ConfigModel>) => void;
  readonly onASTChange: (value: undefined | UpdateModel) => void;
  readonly onMarkersChange: (value: ErrorGroup[] | Error) => void;
  readonly onSelect: (position?: number) => void;
}
