import type { ImportDefaultSpecifier } from '../special/ImportDefaultSpecifier/spec';
import type { ImportNamespaceSpecifier } from '../special/ImportNamespaceSpecifier/spec';
import type { ImportSpecifier } from '../special/ImportSpecifier/spec';

export type ImportClause =
  | ImportDefaultSpecifier
  | ImportNamespaceSpecifier
  | ImportSpecifier;
