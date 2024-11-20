// don't provide a general import case so that people have to strictly type out a declaration
// declare module 'eslint/lib/rules/*' TSESLint, {
//   const rule: TSESLint.RuleModule<any, any[]>;
//   export = rule;
// }

declare module 'eslint/use-at-your-own-risk' {
  export interface RuleMap {
    /* eslint-disable @typescript-eslint/consistent-type-imports -- more concise to use inline imports */
    'arrow-parens': typeof import('eslint/lib/rules/arrow-parens');
    'consistent-return': typeof import('eslint/lib/rules/consistent-return');
    'dot-notation': typeof import('eslint/lib/rules/dot-notation');
    'init-declarations': typeof import('eslint/lib/rules/init-declarations');
    'max-params': typeof import('eslint/lib/rules/max-params');
    'no-dupe-args': typeof import('eslint/lib/rules/no-dupe-args');
    'no-dupe-class-members': typeof import('eslint/lib/rules/no-dupe-class-members');
    'no-empty-function': typeof import('eslint/lib/rules/no-empty-function');
    'no-implicit-globals': typeof import('eslint/lib/rules/no-implicit-globals');
    'no-invalid-this': typeof import('eslint/lib/rules/no-invalid-this');
    'no-loop-func': typeof import('eslint/lib/rules/no-loop-func');
    'no-loss-of-precision': typeof import('eslint/lib/rules/no-loss-of-precision');
    'no-magic-numbers': typeof import('eslint/lib/rules/no-magic-numbers');
    'no-restricted-globals': typeof import('eslint/lib/rules/no-restricted-globals');
    'no-restricted-imports': typeof import('eslint/lib/rules/no-restricted-imports');
    'no-undef': typeof import('eslint/lib/rules/no-undef');
    'no-unused-expressions': typeof import('eslint/lib/rules/no-unused-expressions');
    'no-useless-constructor': typeof import('eslint/lib/rules/no-useless-constructor');
    'prefer-const': typeof import('eslint/lib/rules/prefer-const');
    'prefer-destructuring': typeof import('eslint/lib/rules/prefer-destructuring');
    strict: typeof import('eslint/lib/rules/strict');
    /* eslint-enable @typescript-eslint/consistent-type-imports */
  }

  export const builtinRules: {
    get<K extends keyof RuleMap>(key: K): RuleMap[K] | undefined;
  };
}

declare module 'eslint/lib/rules/arrow-parens' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    | 'expectedParens'
    | 'expectedParensBlock'
    | 'unexpectedParens'
    | 'unexpectedParensInline',
    [
      'always' | 'as-needed',
      {
        requireForBlockBody?: boolean;
      }?,
    ],
    unknown,
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/consistent-return' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'missingReturn' | 'missingReturnValue' | 'unexpectedReturnValue',
    [
      {
        treatUndefinedAsUnspecified?: boolean;
      }?,
    ],
    unknown,
    {
      'ArrowFunctionExpression:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void;
      'FunctionDeclaration:exit'(node: TSESTree.FunctionDeclaration): void;
      'FunctionExpression:exit'(node: TSESTree.FunctionExpression): void;
      ReturnStatement(node: TSESTree.ReturnStatement): void;
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
        genericType?: 'always' | 'never';
        ignoreDestructuring?: boolean;
        properties?: 'always' | 'never';
      },
    ],
    unknown,
    {
      Identifier(node: TSESTree.Identifier): void;
    }
  >;
  export = rule;
}
declare module 'eslint/lib/rules/max-params' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'exceed',
    (
      | { countVoidThis?: boolean; max: number }
      | { countVoidThis?: boolean; maximum: number }
    )[],
    unknown,
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      FunctionDeclaration(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.TSDeclareFunction
          | TSESTree.TSFunctionType,
      ): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-dupe-class-members' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [],
    unknown,
    {
      'ClassBody:exit'(): void;
      'MethodDefinition, PropertyDefinition'(
        node: TSESTree.MethodDefinition | TSESTree.PropertyDefinition,
      ): void;
      ClassBody(): void;
      Program(): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-dupe-args' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'unexpected',
    [],
    unknown,
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
    unknown,
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
    | 'assignmentToReadonlyGlobal'
    | 'globalLexicalBinding'
    | 'globalNonLexicalBinding'
    | 'globalVariableLeak'
    | 'redeclarationOfReadonlyGlobal',
    [],
    unknown,
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
    unknown,
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
      FunctionDeclaration(node: TSESTree.FunctionDeclaration): void;
      FunctionExpression(node: TSESTree.FunctionExpression): void;
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
        detectObjects?: boolean;
        enforceConst?: boolean;
        ignore?: (number | string)[];
        ignoreArrayIndexes?: boolean;
        ignoreEnums?: boolean;
        ignoreNumericLiteralTypes?: boolean;
        ignoreReadonlyClassProperties?: boolean;
        ignoreTypeIndexes?: boolean;
      },
    ],
    unknown,
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
    unknown,
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-restricted-globals' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'customMessage' | 'defaultMessage',
    (
      | string
      | {
          message?: string;
          name: string;
        }
    )[],
    unknown,
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
        allow?: string[];
        builtinGlobals?: boolean;
        hoist?: 'all' | 'functions' | 'never';
        ignoreOnInitialization?: boolean;
      },
    ],
    unknown,
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
    unknown,
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
          args?: 'after-used' | 'all' | 'none';
          argsIgnorePattern?: string;
          caughtErrors?: 'all' | 'none';
          caughtErrorsIgnorePattern?: string;
          destructuredArrayIgnorePattern?: string;
          ignoreRestSiblings?: boolean;
          vars?: 'all' | 'local';
          varsIgnorePattern?: string;
        },
    ],
    unknown,
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
        allowTaggedTemplates?: boolean;
        allowTernary?: boolean;
      },
    ],
    unknown,
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
          classes?: boolean;
          functions?: boolean;
          variables?: boolean;
        }
    )[],
    unknown,
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
    | 'implied'
    | 'module'
    | 'multiple'
    | 'never'
    | 'nonSimpleParameterList'
    | 'unnecessary'
    | 'unnecessaryInClasses'
    | 'wrap',
    ['function' | 'global' | 'never' | 'safe'],
    unknown,
    {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/no-useless-constructor' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'noUselessConstructor' | 'removeConstructor',
    [],
    unknown,
    {
      MethodDefinition(node: TSESTree.MethodDefinition): void;
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
    unknown,
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
    unknown,
    {
      // Common
      ThisExpression(node: TSESTree.ThisExpression): void;
    }
  >;
  export = rule;
}
declare module 'eslint/lib/rules/dot-notation' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  const rule: TSESLint.RuleModule<
    'useBrackets' | 'useDot',
    [
      {
        allowIndexSignaturePropertyAccess?: boolean;
        allowKeywords?: boolean;
        allowPattern?: string;
        allowPrivateClassPropertyAccess?: boolean;
        allowProtectedClassPropertyAccess?: boolean;
      },
    ],
    unknown,
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
    unknown,
    {
      Literal(node: TSESTree.Literal): void;
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
        destructuring?: 'all' | 'any';
        ignoreReadBeforeAssign?: boolean;
      },
    ],
    unknown,
    {
      'Program:exit'(node: TSESTree.Program): void;
      VariableDeclaration(node: TSESTree.VariableDeclaration): void;
    }
  >;
  export = rule;
}

declare module 'eslint/lib/rules/prefer-destructuring' {
  import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

  export interface DestructuringTypeConfig {
    array?: boolean;
    object?: boolean;
  }
  type Option0 =
    | {
        AssignmentExpression?: DestructuringTypeConfig;
        VariableDeclarator?: DestructuringTypeConfig;
      }
    | DestructuringTypeConfig;
  export interface Option1 {
    enforceForRenamedProperties?: boolean;
  }
  const rule: TSESLint.RuleModule<
    'preferDestructuring',
    [Option0, Option1?],
    unknown,
    {
      AssignmentExpression(node: TSESTree.AssignmentExpression): void;
      VariableDeclarator(node: TSESTree.VariableDeclarator): void;
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
          // extended
          allowTypeImports?: boolean;
          importNames?: string[];
          message?: string;
          name: string;
        }
    )[];
    export type ArrayOfStringOrObjectPatterns =
      | {
          // extended
          allowTypeImports?: boolean;
          caseSensitive?: boolean;
          group: string[];
          message?: string;
        }[]
      | string[];
    export type RuleListener =
      | {
          ExportAllDeclaration(node: TSESTree.ExportAllDeclaration): void;
          ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration): void;
          ImportDeclaration(node: TSESTree.ImportDeclaration): void;
        }
      | Record<string, never>;
  }

  export interface ObjectOfPathsAndPatterns {
    paths?: rule.ArrayOfStringOrObject;
    patterns?: rule.ArrayOfStringOrObjectPatterns;
  }

  const rule: TSESLint.RuleModule<
    | 'everything'
    | 'everythingWithCustomMessage'
    | 'importName'
    | 'importNameWithCustomMessage'
    | 'path'
    | 'pathWithCustomMessage'
    | 'patterns'
    | 'patternWithCustomMessage',
    [ObjectOfPathsAndPatterns] | rule.ArrayOfStringOrObject,
    unknown,
    rule.RuleListener
  >;
  export = rule;
}
