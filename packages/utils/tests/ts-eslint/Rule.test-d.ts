import type { TSESTree } from '@typescript-eslint/types';

import type { CodePath, RuleContext, RuleListener } from '../../src/ts-eslint';

type RuleListenerKeysWithoutIndexSignature = {
  [K in keyof RuleListener as string extends K ? never : K]: K;
};

type RuleListenerSelectors = NonNullable<
  RuleListenerKeysWithoutIndexSignature[keyof RuleListenerKeysWithoutIndexSignature]
>;

type AllSelectors =
  `${TSESTree.AST_NODE_TYPES}:exit` | `${TSESTree.AST_NODE_TYPES}`;

type SelectorsWithWrongNodeType = {
  [K in TSESTree.AST_NODE_TYPES]: Parameters<
    NonNullable<RuleListener[K]>
  >[0]['type'] extends K
    ? K extends Parameters<NonNullable<RuleListener[K]>>[0]['type']
      ? never
      : K
    : K;
}[TSESTree.AST_NODE_TYPES];

test('type tests', () => {
  expectTypeOf<SelectorsWithWrongNodeType>().toBeNever();

  expectTypeOf<RuleListenerSelectors>().exclude<AllSelectors>().toBeNever();

  expectTypeOf<AllSelectors>().exclude<RuleListenerSelectors>().toBeNever();
});

declare const context: RuleContext<'messageId', [{ option: string }]>;
declare const codePath: CodePath;

test('removed ESLint 10 RuleContext members are no longer accessible (#11371)', () => {
  // @ts-expect-error -- parserOptions was removed in ESLint 10
  void context.parserOptions;
  // @ts-expect-error -- parserPath was removed in ESLint 10
  void context.parserPath;
  // @ts-expect-error -- parserServices was removed in ESLint 10
  void context.parserServices;
  // @ts-expect-error -- getAncestors was removed in ESLint 10
  void context.getAncestors;
  // @ts-expect-error -- getDeclaredVariables was removed in ESLint 10
  void context.getDeclaredVariables;
  // @ts-expect-error -- getCwd was removed in ESLint 10
  void context.getCwd;
  // @ts-expect-error -- getFilename was removed in ESLint 10
  void context.getFilename;
  // @ts-expect-error -- getPhysicalFilename was removed in ESLint 10
  void context.getPhysicalFilename;
  // @ts-expect-error -- getScope was removed in ESLint 10
  void context.getScope;
  // @ts-expect-error -- getSourceCode was removed in ESLint 10
  void context.getSourceCode;
  // @ts-expect-error -- markVariableAsUsed was removed in ESLint 10
  void context.markVariableAsUsed;
  // @ts-expect-error -- CodePath#currentSegments was removed in ESLint 10
  void codePath.currentSegments;

  // live replacement members remain present
  expectTypeOf(context).toHaveProperty('cwd');
  expectTypeOf(context).toHaveProperty('filename');
  expectTypeOf(context).toHaveProperty('physicalFilename');
  expectTypeOf(context).toHaveProperty('sourceCode');
  expectTypeOf(context).toHaveProperty('report');
  expectTypeOf(context).toHaveProperty('languageOptions');
});
