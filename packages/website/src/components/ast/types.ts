import type { SelectedPosition, SelectedRange } from '../types';

export interface GenericParams<V> {
  readonly propName?: string;
  readonly value: V;
  readonly level: string;
  readonly selection?: SelectedPosition | null;
  readonly onSelectNode?: (node: SelectedRange | null) => void;
  readonly getTypeName: (data: unknown) => string | undefined;
  readonly formatValue?: (key: string, data: unknown) => string | undefined;
  readonly isArray?: boolean;
}
