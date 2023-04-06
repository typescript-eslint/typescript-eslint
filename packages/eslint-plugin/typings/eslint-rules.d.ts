// don't provide a general import case so that people have to strictly type out a declaration
// declare module 'eslint/lib/rules/*' TSESLint, {
//   const rule: TSESLint.RuleModule<any, any[]>;
//   export = rule;
// }

declare module 'eslint/lib/rules/arrow-parens' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'notCamelCase',
    [
      {
        allow?: string[];
        ignoreDestructuring?: boolean;
        properties?: 'always' | 'never';
        genericType?: 'never' | 'always';
      },
    ],
    {
      Identifier(node: TSESTree.Identifier): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/indent' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  type ElementList = number | 'first' | 'off';
  const rule: TSESLint.RuleModule<
    'wrongIndentation',
    [
      ('tab' | number)?,
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
      }?,
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

declare module 'eslint/lib/rules/key-spacing' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
  import type { RuleFunction } from '@typescript-eslint/utils/dist/ts-eslint';

  type Options = [
    {
      beforeColon?: boolean;
      afterColon?: boolean;
      mode?: 'strict' | 'minimum';
      align?:
        | 'value'
        | 'colon'
        | {
            on?: 'value' | 'colon';
            beforeColon?: boolean;
            afterColon?: boolean;
            mode?: 'strict' | 'minimum';
          };
      singleLine?: {
        beforeColon?: boolean;
        afterColon?: boolean;
        mode?: 'strict' | 'minimum';
      };
      multiLine?: {
        beforeColon?: boolean;
        afterColon?: boolean;
        mode?: 'strict' | 'minimum';
        align?:
          | 'value'
          | 'colon'
          | {
              on?: 'value' | 'colon';
              beforeColon?: boolean;
              afterColon?: boolean;
              mode?: 'strict' | 'minimum';
            };
      };
    },
  ];
  type MessageIds = 'extraKey' | 'extraValue' | 'missingKey' | 'missingValue';

  const rule: TSESLint.RuleModule<
    MessageIds,
    Options,
    {
      ObjectExpression: RuleFunction<TSESTree.ObjectExpression>;
      Property: RuleFunction<TSESTree.Property>;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/keyword-spacing' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
  import type { RuleFunction } from '@typescript-eslint/utils/dist/ts-eslint';

  type Options = [
    {
      before?: boolean;
      after?: boolean;
      overrides?: Record<
        string,
        {
          before?: boolean;
          after?: boolean;
        }
      >;
    },
  ];
  type MessageIds =
    | 'expectedBefore'
    | 'expectedAfter'
    | 'unexpectedBefore'
    | 'unexpectedAfter';

  const rule: TSESLint.RuleModule<
    MessageIds,
    Options,
    {
      // Statements
      DebuggerStatement: RuleFunction<TSESTree.DebuggerStatement>;
      WithStatement: RuleFunction<TSESTree.WithStatement>;

      // Statements - Control flow
      BreakStatement: RuleFunction<TSESTree.BreakStatement>;
      ContinueStatement: RuleFunction<TSESTree.ContinueStatement>;
      ReturnStatement: RuleFunction<TSESTree.ReturnStatement>;
      ThrowStatement: RuleFunction<TSESTree.ThrowStatement>;
      TryStatement: RuleFunction<TSESTree.TryStatement>;

      // Statements - Choice
      IfStatement: RuleFunction<TSESTree.IfStatement>;
      SwitchStatement: RuleFunction<TSESTree.Node>;
      SwitchCase: RuleFunction<TSESTree.Node>;

      // Statements - Loops
      DoWhileStatement: RuleFunction<TSESTree.DoWhileStatement>;
      ForInStatement: RuleFunction<TSESTree.ForInStatement>;
      ForOfStatement: RuleFunction<TSESTree.ForOfStatement>;
      ForStatement: RuleFunction<TSESTree.ForStatement>;
      WhileStatement: RuleFunction<TSESTree.WhileStatement>;

      // Statements - Declarations
      ClassDeclaration: RuleFunction<TSESTree.ClassDeclaration>;
      ExportNamedDeclaration: RuleFunction<TSESTree.ExportNamedDeclaration>;
      ExportDefaultDeclaration: RuleFunction<TSESTree.ExportDefaultDeclaration>;
      ExportAllDeclaration: RuleFunction<TSESTree.ExportAllDeclaration>;
      FunctionDeclaration: RuleFunction<TSESTree.FunctionDeclaration>;
      ImportDeclaration: RuleFunction<TSESTree.ImportDeclaration>;
      VariableDeclaration: RuleFunction<TSESTree.VariableDeclaration>;

      // Expressions
      ArrowFunctionExpression: RuleFunction<TSESTree.ArrowFunctionExpression>;
      AwaitExpression: RuleFunction<TSESTree.AwaitExpression>;
      ClassExpression: RuleFunction<TSESTree.ClassExpression>;
      FunctionExpression: RuleFunction<TSESTree.FunctionExpression>;
      NewExpression: RuleFunction<TSESTree.NewExpression>;
      Super: RuleFunction<TSESTree.Super>;
      ThisExpression: RuleFunction<TSESTree.ThisExpression>;
      UnaryExpression: RuleFunction<TSESTree.UnaryExpression>;
      YieldExpression: RuleFunction<TSESTree.YieldExpression>;

      // Others
      ImportNamespaceSpecifier: RuleFunction<TSESTree.ImportNamespaceSpecifier>;
      MethodDefinition: RuleFunction<TSESTree.MethodDefinition>;
      Property: RuleFunction<TSESTree.Property>;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-dupe-class-members' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [],
    {
      Program(): void;
      ClassBody(): void;
      'ClassBody:exit'(): void;
      // for ESLint <= v7
      MethodDefinition?: (node: TSESTree.MethodDefinition) => void;
      // for ESLint v8
      'MethodDefinition, PropertyDefinition'?: (
        node: TSESTree.MethodDefinition | TSESTree.PropertyDefinition,
      ) => void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-dupe-args' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    | 'globalNonLexicalBinding'
    | 'globalLexicalBinding'
    | 'globalVariableLeak'
    | 'assignmentToReadonlyGlobal'
    | 'redeclarationOfReadonlyGlobal',
    [],
    {
      Program(node: TSESTree.Program): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-loop-func' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unsafeRefs',
    [],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-magic-numbers' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
        ignoreTypeIndexes?: boolean;
      },
    ],
    {
      Literal(node: TSESTree.Literal): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-redeclare' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'defaultMessage' | 'customMessage',
    (
      | string
      | {
          name: string;
          message?: string;
        }
    )[],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-shadow' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'noShadow',
    [
      {
        builtinGlobals?: boolean;
        hoist?: 'all' | 'functions' | 'never';
        allow?: string[];
        ignoreOnInitialization?: boolean;
      },
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-undef' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unusedVar',
    [
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
          destructuredArrayIgnorePattern?: string;
        },
    ],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-unused-expressions' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'expected',
    [
      {
        allowShortCircuit?: boolean;
        allowTernary?: boolean;
        allowTaggedTemplates?: boolean;
      },
    ],
    {
      ExpressionStatement(node: TSESTree.ExpressionStatement): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-use-before-define' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'usedBeforeDefine',
    (
      | 'nofunc'
      | {
          functions?: boolean;
          classes?: boolean;
          variables?: boolean;
        }
    )[],
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/strict' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'noUselessConstructor',
    [],
    {
      MethodDefinition(node: TSESTree.MethodDefinition): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-extra-parens' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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
      // -- eslint < 7.19.0
      'ForInStatement, ForOfStatement'(
        node: TSESTree.ForInStatement | TSESTree.ForOfStatement,
      ): void;
      // -- eslint >= 7.19.0
      ForInStatement(node: TSESTree.ForInStatement): void;
      ForOfStatement(node: TSESTree.ForOfStatement): void;
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

declare module 'eslint/lib/rules/semi' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'missingSemi' | 'extraSemi',
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
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'wrongQuotes',
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

declare module 'eslint/lib/rules/block-spacing' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'missing' | 'extra',
    ['always' | 'never'],
    {
      BlockStatement(node: TSESTree.BlockStatement): void;
      StaticBlock(node: TSESTree.StaticBlock): void;
      SwitchStatement(node: TSESTree.SwitchStatement): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/brace-style' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

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

declare module 'eslint/lib/rules/no-extra-semi' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [],
    {
      EmptyStatement(node: TSESTree.EmptyStatement): void;
      ClassBody(node: TSESTree.ClassBody): void;
      // for ESLint <= v7
      MethodDefinition?: (node: TSESTree.MethodDefinition) => void;
      // for ESLint >= v8 < v8.3.0
      'MethodDefinition, PropertyDefinition'?: (
        node: TSESTree.MethodDefinition | TSESTree.PropertyDefinition,
      ) => void;
      // for ESLint >= v8.3.0
      'MethodDefinition, PropertyDefinition, StaticBlock'?: (
        node:
          | TSESTree.MethodDefinition
          | TSESTree.PropertyDefinition
          | TSESTree.StaticBlock,
      ) => void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/lines-around-comment' {
  import type { TSESLint } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'after' | 'before',
    [
      {
        beforeBlockComment?: boolean;
        afterBlockComment?: boolean;
        beforeLineComment?: boolean;
        afterLineComment?: boolean;
        allowBlockStart?: boolean;
        allowBlockEnd?: boolean;
        allowClassStart?: boolean;
        allowClassEnd?: boolean;
        allowObjectStart?: boolean;
        allowObjectEnd?: boolean;
        allowArrayStart?: boolean;
        allowArrayEnd?: boolean;
        allowInterfaceStart?: boolean;
        allowInterfaceEnd?: boolean;
        allowTypeStart?: boolean;
        allowTypeEnd?: boolean;
        allowEnumStart?: boolean;
        allowEnumEnd?: boolean;
        allowModuleStart?: boolean;
        allowModuleEnd?: boolean;
        ignorePattern?: string;
        applyDefaultIgnorePatterns?: boolean;
      }?,
    ],
    {
      Program(): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/lines-between-class-members' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'always' | 'never',
    [
      'always' | 'never',
      {
        exceptAfterSingleLine?: boolean;
        exceptAfterOverload?: boolean;
      }?,
    ],
    {
      ClassBody(node: TSESTree.ClassBody): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/init-declarations' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'initialized' | 'notInitialized',
    [
      'always' | 'never',
      {
        ignoreForLoopInit?: boolean;
      }?,
    ],
    {
      'VariableDeclaration:exit'(node: TSESTree.VariableDeclaration): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-invalid-this' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unexpectedThis',
    [
      {
        capIsConstructor?: boolean;
      }?,
    ],
    {
      // for ESLint < v8.7.0
      Program?: (node: TSESTree.Program) => void;
      'Program:exit'?: (node: TSESTree.Program) => void;
      FunctionDeclaration?: (node: TSESTree.FunctionDeclaration) => void;
      'FunctionDeclaration:exit'?: (node: TSESTree.FunctionDeclaration) => void;
      FunctionExpression?: (node: TSESTree.FunctionExpression) => void;
      'FunctionExpression:exit'?: (node: TSESTree.FunctionExpression) => void;

      // for ESLint >= v8.7.0
      // We don't use it and we don't have the CodePath types, so comment out it.
      // onCodePathStart?: (codePath: unknown, node: TSESTree.Node) => void
      // onCodePathEnd?: (codePath: unknown, node: TSESTree.Node) => void

      // Common
      ThisExpression(node: TSESTree.ThisExpression): void;
    }
  >;
  export = rule;
}
declare module 'eslint/lib/rules/dot-notation' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'useDot' | 'useBrackets',
    [
      {
        allowKeywords?: boolean;
        allowPattern?: string;
        allowPrivateClassPropertyAccess?: boolean;
        allowProtectedClassPropertyAccess?: boolean;
        allowIndexSignaturePropertyAccess?: boolean;
      },
    ],
    {
      MemberExpression(node: TSESTree.MemberExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-loss-of-precision' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'noLossOfPrecision',
    [],
    {
      Literal(node: TSESTree.Literal): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/comma-dangle' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  type StringOptions =
    | 'always-multiline'
    | 'always'
    | 'never'
    | 'only-multiline';
  type Selectors =
    | 'arrays'
    | 'objects'
    | 'imports'
    | 'exports'
    | 'functions'
    | 'enums'
    | 'generics'
    | 'tuples';
  type ObjectOptions = Partial<Record<Selectors, StringOptions | 'ignore'>>;

  const rule: TSESLint.RuleModule<
    'unexpected' | 'missing',
    [StringOptions | ObjectOptions],
    {
      TSEnumDeclaration(node: TSESTree.TSEnumDeclaration): void;
      TSTypeParameterDeclaration(
        node: TSESTree.TSTypeParameterDeclaration,
      ): void;
      TSTupleType(node: TSESTree.TSTupleType): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-duplicate-imports' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    | 'import'
    | 'importAs'
    | 'export'
    | 'exportAs'
    | 'importType'
    | 'importTypeAs'
    | 'exportType'
    | 'exportTypeAs',
    [
      {
        includeExports?: boolean;
      },
    ],
    {
      ImportDeclaration(node: TSESTree.ImportDeclaration): void;
      ExportNamedDeclaration?(node: TSESTree.ExportNamedDeclaration): void;
      ExportAllDeclaration?(node: TSESTree.ExportAllDeclaration): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/space-infix-ops' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'missingSpace',
    [
      {
        int32Hint?: boolean;
      },
    ],
    {
      AssignmentExpression(node: TSESTree.AssignmentExpression): void;
      AssignmentPattern(node: TSESTree.AssignmentPattern): void;
      BinaryExpression(node: TSESTree.BinaryExpression): void;
      LogicalExpression(node: TSESTree.LogicalExpression): void;
      ConditionalExpression(node: TSESTree.ConditionalExpression): void;
      VariableDeclarator(node: TSESTree.VariableDeclarator): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/space-before-blocks' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'missingSpace' | 'unexpectedSpace',
    [
      | 'always'
      | 'never'
      | {
          classes?: 'always' | 'never' | 'off';
          functions?: 'always' | 'never' | 'off';
          keywords?: 'always' | 'never' | 'off';
        },
    ],
    {
      BlockStatement(node: TSESTree.BlockStatement): void;
      ClassBody(node: TSESTree.ClassBody): void;
      SwitchStatement(node: TSESTree.SwitchStatement): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/prefer-const' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'useConst',
    [
      {
        destructuring?: 'any' | 'all';
        ignoreReadBeforeAssign?: boolean;
      },
    ],
    {
      'Program:exit'(node: TSESTree.Program): void;
      VariableDeclaration(node: TSESTree.VariableDeclaration): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/object-curly-spacing' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    | 'requireSpaceBefore'
    | 'requireSpaceAfter'
    | 'unexpectedSpaceBefore'
    | 'unexpectedSpaceAfter',
    [
      'always' | 'never',
      {
        arraysInObjects?: boolean;
        objectsInObjects?: boolean;
      }?,
    ],
    {
      ObjectPattern(node: TSESTree.ObjectPattern): void;
      ObjectExpression(node: TSESTree.ObjectExpression): void;
      ImportDeclaration(node: TSESTree.ImportDeclaration): void;
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-restricted-imports' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  namespace rule {
    export type ArrayOfStringOrObject = (
      | string
      | {
          name: string;
          message?: string;
          importNames?: string[];
          // extended
          allowTypeImports?: boolean;
        }
    )[];
    export type ArrayOfStringOrObjectPatterns =
      | string[]
      | {
          group: string[];
          message?: string;
          caseSensitive?: boolean;
          // extended
          allowTypeImports?: boolean;
        }[];
  }

  interface ObjectOfPathsAndPatterns {
    paths?: rule.ArrayOfStringOrObject;
    patterns?: rule.ArrayOfStringOrObjectPatterns;
  }

  const rule: TSESLint.RuleModule<
    | 'path'
    | 'pathWithCustomMessage'
    | 'patterns'
    | 'patternWithCustomMessage'
    | 'everything'
    | 'everythingWithCustomMessage'
    | 'importName'
    | 'importNameWithCustomMessage',
    rule.ArrayOfStringOrObject | [ObjectOfPathsAndPatterns],
    {
      ImportDeclaration(node: TSESTree.ImportDeclaration): void;
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void;
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration): void;
    }
  >;
  export = rule;
}
