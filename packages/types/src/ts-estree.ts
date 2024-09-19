import type * as TSESTree from './generated/ast-spec';

// augment to add the parent property, which isn't part of the spec
declare module './generated/ast-spec' {
  interface BaseNode {
    parent: TSESTree.Node;
  }

  interface Program {
    /**
     * @remarks This never-used property exists only as a convenience for code that tries to access node parents repeatedly.
     */
    parent?: never;
  }

  interface AccessorPropertyComputedName {
    parent: TSESTree.ClassBody;
  }
  interface AccessorPropertyNonComputedName {
    parent: TSESTree.ClassBody;
  }

  interface VariableDeclaratorDefiniteAssignment {
    parent: TSESTree.VariableDeclaration;
  }

  interface VariableDeclaratorMaybeInit {
    parent: TSESTree.VariableDeclaration;
  }

  interface VariableDeclaratorNoInit {
    parent: TSESTree.VariableDeclaration;
  }

  interface UsingInForOfDeclarator {
    parent: TSESTree.VariableDeclaration;
  }

  interface UsingInNormalContextDeclarator {
    parent: TSESTree.VariableDeclaration;
  }
  interface TSAbstractAccessorPropertyComputedName {
    parent: TSESTree.ClassBody;
  }
  interface TSAbstractAccessorPropertyNonComputedName {
    parent: TSESTree.ClassBody;
  }

  interface CatchClause {
    parent: TSESTree.TryStatement;
  }

  interface ClassBody {
    parent: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
  }

  interface ExportSpecifier {
    parent: TSESTree.ExportNamedDeclaration;
  }

  interface ImportAttribute {
    parent: TSESTree.ImportDeclaration | TSESTree.ImportExpression;
  }

  interface ImportDefaultSpecifier {
    parent: TSESTree.ImportDeclaration;
  }

  interface ImportNamespaceSpecifier {
    parent: TSESTree.ImportDeclaration;
  }

  interface ImportSpecifier {
    parent:
      | TSESTree.ExportAllDeclaration
      | TSESTree.ExportNamedDeclaration
      | TSESTree.ImportDeclaration;
  }

  interface JSXAttribute {
    parent: TSESTree.JSXOpeningElement;
  }

  interface JSXClosingElement {
    parent: TSESTree.JSXElement;
  }

  interface JSXClosingFragment {
    parent: TSESTree.JSXFragment;
  }

  interface JSXOpeningElement {
    parent: TSESTree.JSXElement;
  }

  interface JSXOpeningFragment {
    parent: TSESTree.JSXFragment;
  }

  interface JSXSpreadAttribute {
    parent: TSESTree.JSXOpeningElement;
  }

  interface MethodDefinitionComputedName {
    parent: TSESTree.ClassBody;
  }
  interface MethodDefinitionNonComputedName {
    parent: TSESTree.ClassBody;
  }
  interface TSAbstractMethodDefinitionComputedName {
    parent: TSESTree.ClassBody;
  }
  interface TSAbstractMethodDefinitionNonComputedName {
    parent: TSESTree.ClassBody;
  }

  interface PropertyComputedName {
    parent: TSESTree.ObjectExpression | TSESTree.ObjectPattern;
  }
  interface PropertyNonComputedName {
    parent: TSESTree.ObjectExpression | TSESTree.ObjectPattern;
  }

  interface PropertyDefinitionComputedName {
    parent: TSESTree.ClassBody;
  }
  interface PropertyDefinitionNonComputedName {
    parent: TSESTree.ClassBody;
  }
  interface TSAbstractPropertyDefinitionComputedName {
    parent: TSESTree.ClassBody;
  }
  interface TSAbstractPropertyDefinitionNonComputedName {
    parent: TSESTree.ClassBody;
  }

  interface SpreadElement {
    parent:
      | TSESTree.ArrayExpression
      | TSESTree.CallExpression
      | TSESTree.NewExpression
      | TSESTree.ObjectExpression;
  }

  interface StaticBlock {
    parent: TSESTree.ClassBody;
  }

  interface SwitchCase {
    parent: TSESTree.SwitchStatement;
  }

  interface TemplateElement {
    parent: TSESTree.TemplateLiteral | TSESTree.TSTemplateLiteralType;
  }

  interface TSCallSignatureDeclaration {
    parent: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral;
  }

  interface TSConstructSignatureDeclaration {
    parent: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral;
  }

  interface TSClassImplements {
    parent: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
  }

  interface TSEnumBody {
    parent: TSESTree.TSEnumDeclaration;
  }

  interface TSEnumMemberComputedName {
    parent: TSESTree.TSEnumBody;
  }
  interface TSEnumMemberNonComputedName {
    parent: TSESTree.TSEnumBody;
  }

  interface TSIndexSignature {
    parent:
      | TSESTree.ClassBody
      | TSESTree.TSInterfaceBody
      | TSESTree.TSTypeLiteral;
  }

  interface TSInterfaceBody {
    parent: TSESTree.TSInterfaceDeclaration;
  }

  interface TSInterfaceHeritage {
    parent: TSESTree.TSInterfaceBody;
  }

  interface TSMethodSignatureComputedName {
    parent: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral;
  }
  interface TSMethodSignatureNonComputedName {
    parent: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral;
  }

  interface TSModuleBlock {
    parent: TSESTree.TSModuleDeclaration;
  }

  interface TSParameterProperty {
    parent: TSESTree.FunctionLike;
  }

  interface TSPropertySignatureComputedName {
    parent: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral;
  }
  interface TSPropertySignatureNonComputedName {
    parent: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral;
  }

  interface TSTypeParameter {
    parent:
      | TSESTree.TSInferType
      | TSESTree.TSMappedType
      | TSESTree.TSTypeParameterDeclaration;
  }
}

export * as TSESTree from './generated/ast-spec';
