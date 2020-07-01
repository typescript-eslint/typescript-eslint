import { TSESTree } from '@typescript-eslint/types';
import { ImportBindingDefinition } from '../definition';
import { Referencer } from './Referencer';
import { Visitor } from './Visitor';

class ImportVisitor extends Visitor {
  readonly #declaration: TSESTree.ImportDeclaration;
  readonly #referencer: Referencer;

  constructor(declaration: TSESTree.ImportDeclaration, referencer: Referencer) {
    super(referencer);
    this.#declaration = declaration;
    this.#referencer = referencer;
  }

  static visit(
    referencer: Referencer,
    declaration: TSESTree.ImportDeclaration,
  ): void {
    const importReferencer = new ImportVisitor(declaration, referencer);
    importReferencer.visit(declaration);
  }

  protected visitImport(
    id: TSESTree.Identifier,
    specifier:
      | TSESTree.ImportDefaultSpecifier
      | TSESTree.ImportNamespaceSpecifier
      | TSESTree.ImportSpecifier,
  ): void {
    this.#referencer
      .currentScope()
      .defineIdentifier(
        id,
        new ImportBindingDefinition(id, specifier, this.#declaration),
      );
  }

  protected ImportNamespaceSpecifier(
    node: TSESTree.ImportNamespaceSpecifier,
  ): void {
    const local = node.local;
    this.visitImport(local, node);
  }

  protected ImportDefaultSpecifier(
    node: TSESTree.ImportDefaultSpecifier,
  ): void {
    const local = node.local;
    this.visitImport(local, node);
  }

  protected ImportSpecifier(node: TSESTree.ImportSpecifier): void {
    const local = node.local;
    this.visitImport(local, node);
  }
}

export { ImportVisitor };
