export type OnHoverNodeFn = (node?: [number, number]) => void;

export type ParentNodeType =
  | 'esNode'
  | 'scope'
  | 'scopeDefinition'
  | 'scopeManager'
  | 'scopeReference'
  | 'scopeVariable'
  | 'tsFlow'
  | 'tsNode'
  | 'tsSignature'
  | 'tsSymbol'
  | 'tsType'
  | undefined;
