export type OnHoverNodeFn = (node?: [number, number]) => void;

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
