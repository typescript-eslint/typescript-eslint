import type {
  ParserOptions,
  RulesRecord,
} from '@typescript-eslint/website-eslint';

export interface CompilerFlags extends Record<string, unknown> {
  isolatedModules?: boolean;
  allowSyntheticDefaultImports?: boolean;
  esModuleInterop?: boolean;
  strict?: boolean;
  noImplicitAny?: boolean;
  strictNullChecks?: boolean;
  strictFunctionTypes?: boolean;
  strictBindCallApply?: boolean;
  strictPropertyInitialization?: boolean;
  noImplicitThis?: boolean;
  alwaysStrict?: boolean;
  noUnusedLocals?: boolean;
  noUnusedParameters?: boolean;
  noImplicitReturns?: boolean;
  noFallthroughCasesInSwitch?: boolean;
  allowUnusedLabels?: boolean;
  allowUnreachableCode?: boolean;
  experimentalDecorators?: boolean;
  emitDecoratorMetadata?: boolean;
  noLib?: boolean;
}

export type SourceType = ParserOptions['sourceType'];

export type { RulesRecord } from '@typescript-eslint/website-eslint';

export interface RuleDetails {
  name: string;
  description?: string;
}

export interface ConfigModel {
  jsx?: boolean;
  sourceType?: SourceType;
  rules?: RulesRecord;
  tsConfig?: CompilerFlags;
  code: string;
  ts: string;
  showAST?: boolean | 'ts' | 'es' | 'scope';
}

export interface SelectedPosition {
  line: number;
  column: number;
}

export interface SelectedRange {
  start: SelectedPosition;
  end: SelectedPosition;
}
