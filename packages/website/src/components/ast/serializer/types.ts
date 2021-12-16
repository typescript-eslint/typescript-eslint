import type { ASTViewerModel, SelectedRange, SelectedPosition } from '../types';

export type Serializer = (
  data: Record<string, unknown>,
  key: string | undefined,
  processValue: (data: [string, unknown][]) => ASTViewerModel[],
) => ASTViewerModel | undefined;

export { ASTViewerModel, SelectedRange, SelectedPosition };
