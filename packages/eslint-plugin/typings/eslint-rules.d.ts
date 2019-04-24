// don't provide a general import case so that people have to strictly type out a declaration
// declare module 'eslint/lib/rules/*' {
//   import RuleModule from 'ts-eslint';
//   const rule: RuleModule<any, any[]>;
//   export = rule;
// }

declare module 'eslint/lib/rules/arrow-parens' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    | 'unexpectedParens'
    | 'expectedParens'
    | 'unexpectedParensInline'
    | 'expectedParensBlock',
    [
      'always' | 'as-needed',
      {
        requireForBlockBody?: boolean;
      }?
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

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
        node: TSESTree.ArrayExpression | TSESTree.ArrayPattern,
      ): void;
      'ObjectExpression, ObjectPattern'(
        node: TSESTree.ObjectExpression | TSESTree.ObjectPattern,
      ): void;
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      AssignmentExpression(node: TSESTree.AssignmentExpression): void;
      'BinaryExpression, LogicalExpression'(
        node: TSESTree.BinaryExpression | TSESTree.LogicalExpression,
      ): void;
      'BlockStatement, ClassBody'(
        node: TSESTree.BlockStatement | TSESTree.ClassBody,
      ): void;
      CallExpression(node: TSESTree.CallExpression): void;
      'ClassDeclaration[superClass], ClassExpression[superClass]'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ): void;
      ConditionalExpression(node: TSESTree.ConditionalExpression): void;
      'DoWhileStatement, WhileStatement, ForInStatement, ForOfStatement'(
        node:
          | TSESTree.DoWhileStatement
          | TSESTree.WhileStatement
          | TSESTree.ForInStatement
          | TSESTree.ForOfStatement,
      ): void;
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void;
      ForStatement(node: TSESTree.ForStatement): void;
      'FunctionDeclaration, FunctionExpression'(
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
      ): void;
      IfStatement(node: TSESTree.IfStatement): void;
      ImportDeclaration(node: TSESTree.ImportDeclaration): void;
      'MemberExpression, JSXMemberExpression, MetaProperty'(
        node:
          | TSESTree.MemberExpression
          | TSESTree.JSXMemberExpression
          | TSESTree.MetaProperty,
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

declare module 'eslint/lib/rules/no-dupe-args' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    'unexpected',
    [],
    {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-implicit-globals' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    [],
    {
      Program(node: TSESTree.Program): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-redeclare' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    [
      {
        builtinGlobals?: boolean;
      }?
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-restricted-globals' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    (
      | string
      | {
          name: string;
          message?: string;
        })[],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-shadow' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    [
      {
        builtinGlobals?: boolean;
        hoist: 'all' | 'functions' | 'never';
        allow: string[];
      }
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-undef' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    'undef',
    [
      {
        typeof?: boolean;
      }
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-unused-vars' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    (
      | 'all'
      | 'local'
      | {
          vars?: 'all' | 'local';
          varsIgnorePattern?: string;
          args?: 'all' | 'after-used' | 'none';
          ignoreRestSiblings?: boolean;
          argsIgnorePattern?: string;
          caughtErrors?: 'all' | 'none';
          caughtErrorsIgnorePattern?: string;
        })[],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-use-before-define' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    (
      | 'nofunc'
      | {
          functions?: boolean;
          classes?: boolean;
          variables?: boolean;
        })[],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/strict' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    | 'function'
    | 'global'
    | 'multiple'
    | 'never'
    | 'unnecessary'
    | 'module'
    | 'implied'
    | 'unnecessaryInClasses'
    | 'nonSimpleParameterList'
    | 'wrap',
    ['never' | 'global' | 'function' | 'safe'],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
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

declare module 'eslint/lib/rules/no-extra-parens' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    'unexpected',
    (
      | 'all'
      | 'functions'
      | {
          conditionalAssign?: boolean;
          returnAssign?: boolean;
          nestedBinaryExpressions?: boolean;
          ignoreJSX?: 'none' | 'all' | 'multi-line' | 'single-line';
          enforceForArrowConditionals?: boolean;
        })[],
    {
      MemberExpression(node: TSESTree.MemberExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/semi' {
  import { TSESTree } from '@typescript-eslint/typescript-estree';
  import RuleModule from 'ts-eslint';

  const rule: RuleModule<
    never,
    [
      'always' | 'never',
      {
        beforeStatementContinuationChars?: 'always' | 'any' | 'never';
        omitLastInOneLineBlock?: boolean;
      }?
    ],
    {
      VariableDeclaration(node: TSESTree.VariableDeclaration): void;
      ExpressionStatement(node: TSESTree.ExpressionStatement): void;
      ReturnStatement(node: TSESTree.ReturnStatement): void;
      ThrowStatement(node: TSESTree.ThrowStatement): void;
      DoWhileStatement(node: TSESTree.DoWhileStatement): void;
      DebuggerStatement(node: TSESTree.DebuggerStatement): void;
      BreakStatement(node: TSESTree.BreakStatement): void;
      ContinueStatement(node: TSESTree.ContinueStatement): void;
      ImportDeclaration(node: TSESTree.ImportDeclaration): void;
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration): void;
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void;
      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration): void;
    }
  >;
  export = rule;
}
