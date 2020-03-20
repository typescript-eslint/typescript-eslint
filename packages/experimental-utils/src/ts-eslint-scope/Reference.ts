import ESLintReference from 'eslint-scope/lib/reference';
import { TSESTree } from '../ts-estree';
import { Scope } from './Scope';
import { Variable } from './Variable';

export type ReferenceFlag = 0x1 | 0x2 | 0x3;

interface Reference {
  identifier: TSESTree.Identifier;
  from: Scope;
  resolved: Variable | null;
  writeExpr: TSESTree.Node | null;
  init: boolean;

  partial: boolean;
  __maybeImplicitGlobal: boolean;
  tainted?: boolean;
  typeMode?: boolean;

  isWrite(): boolean;
  isRead(): boolean;
  isWriteOnly(): boolean;
  isReadOnly(): boolean;
  isReadWrite(): boolean;
}
const Reference = ESLintReference as {
  new (
    identifier: TSESTree.Identifier,
    scope: Scope,
    flag?: ReferenceFlag,
    writeExpr?: TSESTree.Node | null,
    maybeImplicitGlobal?: boolean,
    partial?: boolean,
    init?: boolean,
  ): Reference;

  READ: 0x1;
  WRITE: 0x2;
  RW: 0x3;
};

export { Reference };
