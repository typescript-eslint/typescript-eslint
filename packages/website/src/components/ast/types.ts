import type { SelectedPosition, SelectedRange } from '../types';
import Monaco from 'monaco-editor';

export type GetTooltipFn = (data: ASTViewerModelMap) => string | undefined;
export type OnSelectNodeFn = (node: SelectedRange | null) => void;

export type ASTViewerModelTypeSimple =
  | 'ref'
  | 'string'
  | 'number'
  | 'class'
  | 'boolean'
  | 'bigint'
  | 'regexp'
  | 'undefined';

export type ASTViewerModelTypeComplex = 'object' | 'array';

export interface ASTViewerModelBase {
  name?: string;
  range?: SelectedRange;
}

export interface ASTViewerModelSimple extends ASTViewerModelBase {
  type: ASTViewerModelTypeSimple;
  value: string;
}

export interface ASTViewerModelComplex extends ASTViewerModelBase {
  type: ASTViewerModelTypeComplex;
  value: ASTViewerModelMap[];
}

export type ASTViewerModel = ASTViewerModelSimple | ASTViewerModelComplex;

export interface ASTViewerModelMap<T = ASTViewerModel> {
  key?: string;
  model: T;
}

export type ASTViewerModelMapSimple = ASTViewerModelMap<ASTViewerModelSimple>;
export type ASTViewerModelMapComplex = ASTViewerModelMap<ASTViewerModelComplex>;

export interface GenericParams<V> {
  readonly data: V;
  readonly level: string;
  readonly selection?: SelectedPosition | null;
  readonly onSelectNode?: OnSelectNodeFn;
  readonly getTooltip?: GetTooltipFn;
}

export interface ASTViewerBaseProps {
  readonly position?: Monaco.Position | null;
  readonly onSelectNode?: OnSelectNodeFn;
}

export interface ASTViewerProps extends ASTViewerBaseProps {
  readonly getTooltip?: GetTooltipFn;
  readonly value: ASTViewerModelMap | string;
}

export type Serializer = (
  data: Record<string, unknown>,
  key: string | undefined,
  processValue: (data: [string, unknown][]) => ASTViewerModelMap[],
) => ASTViewerModel | undefined;

export type { SelectedPosition, SelectedRange };
