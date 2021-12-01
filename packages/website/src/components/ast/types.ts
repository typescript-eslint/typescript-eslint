import type { SelectedPosition, SelectedRange } from '../types';

export interface GenericParams<V> {
  readonly propName?: string;
  readonly name?: string;
  readonly value: V;
  readonly level: string;
  readonly selection?: SelectedPosition | null;
  readonly onSelectNode?: (node: SelectedRange | null) => void;
}
