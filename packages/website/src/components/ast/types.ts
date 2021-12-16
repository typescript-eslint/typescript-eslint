import type { SelectedPosition, SelectedRange } from '../types';
import Monaco from 'monaco-editor';

export type GetTooltipFn = (data: ASTViewerModelSimple) => string | undefined;
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
  key?: string;
  name?: string;
  range?: SelectedRange;
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
