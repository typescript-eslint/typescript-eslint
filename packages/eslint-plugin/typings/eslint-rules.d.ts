// don't provide a general import case so that people have to strictly type out a declaration
// declare module 'eslint/lib/rules/*' TSESLint, {
//   const rule: TSESLint.RuleModule<any, any[]>;
//   export = rule;
// }

declare module 'eslint/lib/rules/arrow-parens' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    | 'unexpectedParens'
    | 'expectedParens'
    | 'unexpectedParensInline'
    | 'expectedParensBlock',
    [
      'always' | 'as-needed',
      {
        requireForBlockBody?: boolean;
      }?,
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/camelcase' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'notCamelCase',
    [
      {
        allow?: string[];
        ignoreDestructuring?: boolean;
        properties?: 'always' | 'never';
      },
    ],
    {
      Identifier(node: TSESTree.Identifier): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/indent' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  type Listener = (node: TSESTree.Node) => void;
  type ElementList = number | 'first' | 'off';
  const rule: TSESLint.RuleModule<
    'wrongIndentation',
    [
      ('tab' | number)?,
      ({
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
      })?,
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
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [],
    {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-empty-function' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [
      {
        allow?: string[];
      },
    ],
    {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-implicit-globals' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    never,
    [],
    {
      Program(node: TSESTree.Program): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-magic-numbers' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'noMagic',
    [
      {
        ignore?: string[];
        ignoreArrayIndexes?: boolean;
        enforceConst?: boolean;
        detectObjects?: boolean;
        ignoreNumericLiteralTypes?: boolean;
        ignoreEnums?: boolean;
        ignoreReadonlyClassProperties?: boolean;
      },
    ],
    {
      Literal(node: TSESTree.Literal): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-redeclare' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'redeclared' | 'redeclaredAsBuiltin' | 'redeclaredBySyntax',
    [
      {
        builtinGlobals?: boolean;
      }?,
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-restricted-globals' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
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
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    never,
    [
      {
        builtinGlobals?: boolean;
        hoist: 'all' | 'functions' | 'never';
        allow: string[];
      },
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-undef' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'undef',
    [
      {
        typeof?: boolean;
      },
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-unused-vars' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
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

declare module 'eslint/lib/rules/no-unused-expressions' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'expected',
    (
      | 'all'
      | 'local'
      | {
          allowShortCircuit?: boolean;
          allowTernary?: boolean;
          allowTaggedTemplates?: boolean;
        })[],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-use-before-define' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
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
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
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
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    never,
    [],
    {
      MethodDefinition(node: TSESTree.MethodDefinition): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-extra-parens' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [
      'all' | 'functions',
      {
        conditionalAssign?: boolean;
        returnAssign?: boolean;
        nestedBinaryExpressions?: boolean;
        ignoreJSX?: 'none' | 'all' | 'multi-line' | 'single-line';
        enforceForArrowConditionals?: boolean;
      }?,
    ],
    {
      ArrayExpression(node: TSESTree.ArrayExpression): void;
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      AssignmentExpression(node: TSESTree.AssignmentExpression): void;
      AwaitExpression(node: TSESTree.AwaitExpression): void;
      BinaryExpression(node: TSESTree.BinaryExpression): void;
      CallExpression(node: TSESTree.CallExpression): void;
      ClassDeclaration(node: TSESTree.ClassDeclaration): void;
      ClassExpression(node: TSESTree.ClassExpression): void;
      ConditionalExpression(node: TSESTree.ConditionalExpression): void;
      DoWhileStatement(node: TSESTree.DoWhileStatement): void;
      'ForInStatement, ForOfStatement'(
        node: TSESTree.ForInStatement | TSESTree.ForOfStatement,
      ): void;
      ForStatement(node: TSESTree.ForStatement): void;
      'ForStatement > *.init:exit'(node: TSESTree.Node): void;
      IfStatement(node: TSESTree.IfStatement): void;
      LogicalExpression(node: TSESTree.LogicalExpression): void;
      MemberExpression(node: TSESTree.MemberExpression): void;
      NewExpression(node: TSESTree.NewExpression): void;
      ObjectExpression(node: TSESTree.ObjectExpression): void;
      ReturnStatement(node: TSESTree.ReturnStatement): void;
      SequenceExpression(node: TSESTree.SequenceExpression): void;
      SpreadElement(node: TSESTree.SpreadElement): void;
      SwitchCase(node: TSESTree.SwitchCase): void;
      SwitchStatement(node: TSESTree.SwitchStatement): void;
      ThrowStatement(node: TSESTree.ThrowStatement): void;
      UnaryExpression(node: TSESTree.UnaryExpression): void;
      UpdateExpression(node: TSESTree.UpdateExpression): void;
      VariableDeclarator(node: TSESTree.VariableDeclarator): void;
      WhileStatement(node: TSESTree.WhileStatement): void;
      WithStatement(node: TSESTree.WithStatement): void;
      YieldExpression(node: TSESTree.YieldExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/require-await' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    never,
    [],
    {
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void;
      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void;
      'ArrowFunctionExpression:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void;
      ReturnStatement(node: TSESTree.ReturnStatement): void;
      AwaitExpression(node: TSESTree.AwaitExpression): void;
      ForOfStatement(node: TSESTree.ForOfStatement): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/semi' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    never,
    [
      'always' | 'never',
      {
        beforeStatementContinuationChars?: 'always' | 'any' | 'never';
        omitLastInOneLineBlock?: boolean;
      }?,
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

declare module 'eslint/lib/rules/quotes' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    never,
    [
      'single' | 'double' | 'backtick',
      {
        allowTemplateLiterals?: boolean;
        avoidEscape?: boolean;
      }?,
    ],
    {
      Literal(node: TSESTree.Literal): void;
      TemplateLiteral(node: TSESTree.TemplateLiteral): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/brace-style' {
  import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

  const rule: TSESLint.RuleModule<
    | 'nextLineOpen'
    | 'sameLineOpen'
    | 'blockSameLine'
    | 'nextLineClose'
    | 'singleLineClose'
    | 'sameLineClose',
    [
      '1tbs' | 'stroustrup' | 'allman',
      {
        allowSingleLine?: boolean;
      }?,
    ],
    {
      BlockStatement(node: TSESTree.BlockStatement): void;
      ClassBody(node: TSESTree.ClassBody): void;
      SwitchStatement(node: TSESTree.SwitchStatement): void;
      IfStatement(node: TSESTree.IfStatement): void;
      TryStatement(node: TSESTree.TryStatement): void;
    }
  >;
  export = rule;
}
