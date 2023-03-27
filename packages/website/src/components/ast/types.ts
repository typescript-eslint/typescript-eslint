import type { getTooltipLabel, getTypeName } from './utils';

export type OnHoverNodeFn = (node?: [number, number]) => void;

export type GetTypeNameFN = typeof getTypeName;
export type GetTooltipLabelFn = typeof getTooltipLabel;

export type ParentNodeType =
  | 'esNode'
  | 'tsNode'
  | 'tsType'
  | 'tsSymbol'
  | 'tsSignature'
  | 'tsFlow'
  | 'scope'
  | 'scopeManager'
  | 'scopeVariable'
  | 'scopeDefinition'
  | 'scopeReference'
  | undefined;
