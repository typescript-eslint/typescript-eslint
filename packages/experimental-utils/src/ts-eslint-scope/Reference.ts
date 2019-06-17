import { TSESTree } from '@typescript-eslint/typescript-estree';
import ESLintReference from 'eslint-scope/lib/reference';
import { Scope } from './Scope';
import { Variable } from './Variable';

interface Reference {
  identifier: TSESTree.Identifier;
  from: Scope;
  resolved: Variable | null;
  writeExpr: TSESTree.Node | null;
  init: boolean;

  isWrite(): boolean;
  isRead(): boolean;
  isWriteOnly(): boolean;
  isReadOnly(): boolean;
  isReadWrite(): boolean;
}
const Reference = ESLintReference as {
  new (): Reference;

  READ: 0x1;
  WRITE: 0x2;
  RW: 0x3;
};

export { Reference };
