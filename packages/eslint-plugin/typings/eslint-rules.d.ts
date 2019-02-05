// don't provide a general import case so that people have to strictly type out a declaration
// declare module 'eslint/lib/rules/*' {
//   import RuleModule from 'ts-eslint';
//   const rule: RuleModule<any, any[]>;
//   export = rule;
// }

declare module 'eslint/lib/rules/camelcase' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    'notCamelCase',
    [
      {
        allow?: string[];
        ignoreDestructuring?: boolean;
        properties?: 'always' | 'never';
      }
    ],
    {
      Identifier(node: TSESTree.Identifier): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/indent' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  type Listener = (node: TSESTree.Node) => void;
  type ElementList = number | 'first' | 'off';
  const rule: RuleModule<
    'wrongIndentation',
    [
      'tab' | number,
      {
        SwitchCase?: number;
        VariableDeclarator?:
          | ElementList
          | {
              var?: ElementList;
              let?: ElementList;
              const?: ElementList;
            };
        outerIIFEBody?: number;
        MemberExpression?: number | 'off';
        FunctionDeclaration?: {
          parameters?: ElementList;
          body?: number;
        };
        FunctionExpression?: {
          parameters?: ElementList;
          body?: number;
        };
        CallExpression?: {
          arguments?: ElementList;
        };
        ArrayExpression?: ElementList;
        ObjectExpression?: ElementList;
        ImportDeclaration?: ElementList;
        flatTernaryExpressions?: boolean;
        ignoredNodes?: string[];
        ignoreComments?: boolean;
      }
    ],
    {
      '*:exit'(node: TSESTree.Node): void;
      'ArrayExpression, ArrayPattern'(
        node: TSESTree.ArrayExpression | TSESTree.ArrayPattern
      ): void;
      'ObjectExpression, ObjectPattern'(
        node: TSESTree.ObjectExpression | TSESTree.ObjectPattern
      ): void;
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      AssignmentExpression(node: TSESTree.AssignmentExpression): void;
      'BinaryExpression, LogicalExpression'(
        node: TSESTree.BinaryExpression | TSESTree.LogicalExpression
      ): void;
      'BlockStatement, ClassBody'(
        node: TSESTree.BlockStatement | TSESTree.ClassBody
      ): void;
      CallExpression(node: TSESTree.CallExpression): void;
      'ClassDeclaration[superClass], ClassExpression[superClass]'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression
      ): void;
      ConditionalExpression(node: TSESTree.ConditionalExpression): void;
      'DoWhileStatement, WhileStatement, ForInStatement, ForOfStatement'(
        node:
          | TSESTree.DoWhileStatement
          | TSESTree.WhileStatement
          | TSESTree.ForInStatement
          | TSESTree.ForOfStatement
      ): void;
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void;
      ForStatement(node: TSESTree.ForStatement): void;
      'FunctionDeclaration, FunctionExpression'(
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression
      ): void;
      IfStatement(node: TSESTree.IfStatement): void;
      ImportDeclaration(node: TSESTree.ImportDeclaration): void;
      'MemberExpression, JSXMemberExpression, MetaProperty'(
        node:
          | TSESTree.MemberExpression
          | TSESTree.JSXMemberExpression
          | TSESTree.MetaProperty
      ): void;
      NewExpression(node: TSESTree.NewExpression): void;
      Property(node: TSESTree.Property): void;
      SwitchStatement(node: TSESTree.SwitchStatement): void;
      SwitchCase(node: TSESTree.SwitchCase): void;
      TemplateLiteral(node: TSESTree.TemplateLiteral): void;
      VariableDeclaration(node: TSESTree.VariableDeclaration): void;
      VariableDeclarator(node: TSESTree.VariableDeclarator): void;
      'JSXAttribute[value]'(node: TSESTree.JSXAttribute): void;
      JSXElement(node: TSESTree.JSXElement): void;
      JSXOpeningElement(node: TSESTree.JSXOpeningElement): void;
      JSXClosingElement(node: TSESTree.JSXClosingElement): void;
      JSXExpressionContainer(node: TSESTree.JSXExpressionContainer): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-useless-constructor' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    [],
    {
      MethodDefinition(node: TSESTree.MethodDefinition): void;
    }
  >;
  export = rule;
}
