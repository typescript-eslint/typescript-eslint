import ESLintVariable from 'eslint-scope/lib/variable';
import type { TSESTree } from '../ts-estree';
import type { Reference } from './Reference';
import type { Definition } from './Definition';
import type { Scope } from './Scope';

interface Variable {
  name: string;
  identifiers: TSESTree.Identifier[];
  references: Reference[];
  defs: Definition[];
  eslintUsed?: boolean;
  stack?: unknown;
  tainted?: boolean;
  scope?: Scope;
}

const Variable = ESLintVariable as {
  new (): Variable;
};

export { Variable };
