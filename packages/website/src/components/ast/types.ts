import type { SelectedPosition, SelectedRange } from '../types';
import { TSESTree } from '@typescript-eslint/website-eslint';
import Monaco from 'monaco-editor';

export type GetNodeNameFn = (data: unknown) => string | undefined;
export type GetTooltipFn = (key: string, data: unknown) => string | undefined;
export type GetRangeFn = (data: unknown) => SelectedRange | undefined;
export type OnSelectNodeFn = (node: SelectedRange | null) => void;
export type FilterPropsFn = (item: [string, unknown]) => boolean;

export interface GenericParams<V> {
  readonly propName?: string;
  readonly value: V;
  readonly level: string;
  readonly selection?: SelectedPosition | null;
  readonly onSelectNode?: OnSelectNodeFn;
  readonly getNodeName: GetNodeNameFn;
  readonly getTooltip?: GetTooltipFn;
  readonly filterProps: FilterPropsFn;
  readonly getRange: GetRangeFn;
  readonly isArray?: boolean;
}

export interface ASTViewerBaseProps {
  readonly value: Record<string, unknown> | TSESTree.Node | string;
  readonly position?: Monaco.Position | null;
  readonly onSelectNode?: OnSelectNodeFn;
}

export interface ASTViewerProps extends ASTViewerBaseProps {
  readonly getNodeName: GetNodeNameFn;
  readonly getTooltip?: GetTooltipFn;
  readonly getRange: GetRangeFn;
  readonly filterProps: FilterPropsFn;
}

export type { SelectedPosition, SelectedRange };
