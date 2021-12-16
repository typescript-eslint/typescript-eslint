import type { SelectedPosition, SelectedRange } from '../types';
import Monaco from 'monaco-editor';

export type FilterPropsFnData = Record<string, unknown> | unknown[];

export type GetNodeNameFn = (data: unknown) => string | undefined;
export type GetTooltipFn = (key: string, data: unknown) => string | undefined;
export type GetRangeFn = (data: unknown) => SelectedRange | undefined;
export type OnSelectNodeFn = (node: SelectedRange | null) => void;
export type FilterPropsFn = (item: FilterPropsFnData) => [string, unknown][];

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

export type ASTViewerModelType =
  | ASTViewerModelTypeComplex
  | ASTViewerModelTypeSimple;

export interface ASTViewerModelBase {
  key?: string;
  name?: string;
  range?: SelectedRange;
  tooltip?: string;
}

export interface ASTViewerModelSimple extends ASTViewerModelBase {
  type: ASTViewerModelTypeSimple;
  value: string;
}

export interface ASTViewerModelComplex extends ASTViewerModelBase {
  type: ASTViewerModelTypeComplex;
  value: ASTViewerModel[];
}

export type ASTViewerModel = ASTViewerModelSimple | ASTViewerModelComplex;

export interface GenericParams<V> {
  readonly propName?: string;
  readonly value: V;
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
  readonly value: ASTViewerModel | string;
}

export type { SelectedPosition, SelectedRange };
