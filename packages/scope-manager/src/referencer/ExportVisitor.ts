import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { Referencer } from './Referencer';
import { Visitor } from './Visitor';

type ExportNode =
  | TSESTree.ExportAllDeclaration
  | TSESTree.ExportDefaultDeclaration
  | TSESTree.ExportNamedDeclaration;

class ExportVisitor extends Visitor {
  readonly #referencer: Referencer;
  readonly #exportNode: ExportNode;

  constructor(node: ExportNode, referencer: Referencer) {
    super(referencer);
    this.#exportNode = node;
    this.#referencer = referencer;
  }

  static visit(referencer: Referencer, node: ExportNode): void {
    const exportReferencer = new ExportVisitor(node, referencer);
    exportReferencer.visit(node);
  }

  protected Identifier(node: TSESTree.Identifier): void {
    if (this.#exportNode.exportKind === 'type') {
      // type exports can only reference types
      this.#referencer.currentScope().referenceType(node);
    } else {
      this.#referencer.currentScope().referenceDualValueType(node);
    }
  }

  protected ExportDefaultDeclaration(
    node: TSESTree.ExportDefaultDeclaration,
  ): void {
    if (node.declaration.type === AST_NODE_TYPES.Identifier) {
      // export default A;
      // this could be a type or a variable
      this.visit(node.declaration);
    } else {
      // export const a = 1;
      // export something();
      // etc
      // these not included in the scope of this visitor as they are all guaranteed to be values or declare variables
    }
  }

  protected ExportNamedDeclaration(
    node: TSESTree.ExportNamedDeclaration,
  ): void {
    if (node.source) {
      // export ... from 'foo';
      // these are external identifiers so there shouldn't be references or defs
      return;
    }

    if (!node.declaration) {
      // export { x };
      this.visitChildren(node);
    } else {
      // export const x = 1;
      // this is not included in the scope of this visitor as it creates a variable
    }
  }

  protected ExportSpecifier(node: TSESTree.ExportSpecifier): void {
    this.visit(node.local);
  }
}

export { ExportVisitor };
