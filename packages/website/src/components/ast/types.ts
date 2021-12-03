import type { SelectedPosition, SelectedRange } from '../types';
import { TSESTree } from '@typescript-eslint/website-eslint';
import Monaco from 'monaco-editor';

export type GetNodeNameFn = (data: unknown) => string | undefined;
export type GetTooltipFn = (key: string, data: unknown) => string | undefined;
export type OnSelectNodeFn = (node: SelectedRange | null) => void;

export interface GenericParams<V> {
  readonly propName?: string;
  readonly value: V;
  readonly level: string;
  readonly selection?: SelectedPosition | null;
  readonly onSelectNode?: OnSelectNodeFn;
  readonly getNodeName: GetNodeNameFn;
  readonly getTooltip?: GetTooltipFn;
  readonly isArray?: boolean;
}

export interface ASTViewerBaseProps {
  readonly value: Record<string, unknown> | TSESTree.Node | string;
  readonly position?: Monaco.Position | null;
  readonly onSelectNode?: OnSelectNodeFn;
}

export type { SelectedPosition, SelectedRange };
