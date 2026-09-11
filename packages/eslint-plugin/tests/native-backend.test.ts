import * as parser from '@typescript-eslint/parser';
import { Linter } from 'eslint';

import awaitThenable from '../src/rules/await-thenable';
import noArrayDelete from '../src/rules/no-array-delete';
import noBaseToString from '../src/rules/no-base-to-string';
import noConfusingVoidExpression from '../src/rules/no-confusing-void-expression';
import noDeprecated from '../src/rules/no-deprecated';
import noFloatingPromises from '../src/rules/no-floating-promises';
import noForInArray from '../src/rules/no-for-in-array';
import noMisusedPromises from '../src/rules/no-misused-promises';
import noMisusedSpread from '../src/rules/no-misused-spread';
import noMixedEnums from '../src/rules/no-mixed-enums';
import noUnnecessaryCondition from '../src/rules/no-unnecessary-condition';
import noUnnecessaryQualifier from '../src/rules/no-unnecessary-qualifier';
import noUnnecessaryTypeArguments from '../src/rules/no-unnecessary-type-arguments';
import noUnnecessaryTypeAssertion from '../src/rules/no-unnecessary-type-assertion';
import noUnsafeArgument from '../src/rules/no-unsafe-argument';
import noUnsafeAssignment from '../src/rules/no-unsafe-assignment';
import noUnsafeReturn from '../src/rules/no-unsafe-return';
import noUnsafeUnaryMinus from '../src/rules/no-unsafe-unary-minus';
import onlyThrowError from '../src/rules/only-throw-error';
import preferNullishCoalescing from '../src/rules/prefer-nullish-coalescing';
import preferReadonlyParameterTypes from '../src/rules/prefer-readonly-parameter-types';
import preferReduceTypeParameter from '../src/rules/prefer-reduce-type-parameter';
import preferStringStartsEndsWith from '../src/rules/prefer-string-starts-ends-with';
import requireArraySortCompare from '../src/rules/require-array-sort-compare';
import restrictPlusOperands from '../src/rules/restrict-plus-operands';
import restrictTemplateExpressions from '../src/rules/restrict-template-expressions';
import strictBooleanExpressions from '../src/rules/strict-boolean-expressions';
import switchExhaustivenessCheck from '../src/rules/switch-exhaustiveness-check';
import unboundMethod from '../src/rules/unbound-method';
import { getFixturesRootDir } from './RuleTester';

/**
 * Every rule below is the shipped implementation, untouched. Each case is run
 * twice — once against the classic TypeScript backend and once against the
 * TypeScript 7.1 native backend — and the two result sets are required to
 * match. A rule that behaves differently on the native backend is a gap in the
 * adapters, not something for the rule to know about.
 */
const RULES = {
  'await-thenable': awaitThenable,
  'no-array-delete': noArrayDelete,
  'no-base-to-string': noBaseToString,
  'no-confusing-void-expression': noConfusingVoidExpression,
  'no-deprecated': noDeprecated,
  'no-floating-promises': noFloatingPromises,
  'no-for-in-array': noForInArray,
  'no-misused-promises': noMisusedPromises,
  'no-misused-spread': noMisusedSpread,
  'no-mixed-enums': noMixedEnums,
  'no-unnecessary-condition': noUnnecessaryCondition,
  'no-unnecessary-qualifier': noUnnecessaryQualifier,
  'no-unnecessary-type-arguments': noUnnecessaryTypeArguments,
  'no-unnecessary-type-assertion': noUnnecessaryTypeAssertion,
  'no-unsafe-argument': noUnsafeArgument,
  'no-unsafe-assignment': noUnsafeAssignment,
  'no-unsafe-return': noUnsafeReturn,
  'no-unsafe-unary-minus': noUnsafeUnaryMinus,
  'only-throw-error': onlyThrowError,
  'prefer-nullish-coalescing': preferNullishCoalescing,
  'prefer-readonly-parameter-types': preferReadonlyParameterTypes,
  'prefer-reduce-type-parameter': preferReduceTypeParameter,
  'prefer-string-starts-ends-with': preferStringStartsEndsWith,
  'require-array-sort-compare': requireArraySortCompare,
  'restrict-plus-operands': restrictPlusOperands,
  'restrict-template-expressions': restrictTemplateExpressions,
  'strict-boolean-expressions': strictBooleanExpressions,
  'switch-exhaustiveness-check': switchExhaustivenessCheck,
  'unbound-method': unboundMethod,
} as const;

type RuleName = keyof typeof RULES;

const filename = `${getFixturesRootDir()}/file.ts`;

interface Case {
  code: string;
  options?: unknown[];
}

function lint(ruleName: RuleName, testCase: Case, native: boolean): string[] {
  const linter = new Linter();
  return linter
    .verify(
      testCase.code,
      {
        files: ['**/*.ts'],
        languageOptions: {
          parser: parser as unknown as Linter.Parser,
          parserOptions: {
            ...(native
              ? { projectService: { backend: 'native' } }
              : { projectService: true }),
            tsconfigRootDir: getFixturesRootDir(),
          },
        },
        plugins: {
          parity: {
            rules: {
              [ruleName]: RULES[ruleName] as unknown as Linter.RuleModule,
            },
          },
        },
        rules: {
          [`parity/${ruleName}`]: testCase.options
            ? ['error', ...testCase.options]
            : 'error',
        },
      } as unknown as Linter.Config,
      filename,
    )
    .map(message => `${message.ruleId ?? '(fatal)'}: ${message.message}`);
}

const CASES: Record<RuleName, (string | Case)[]> = {
  'await-thenable': [
    'async function f() { await 1; }',
    'async function f() { await Promise.resolve(1); }',
    'async function f<T extends Promise<number>>(v: T) { await v; }',
    'async function f(v: Promise<number> | number) { await v; }',
    'async function f() { for await (const x of [1, 2]) { x; } }',
  ],
  'no-array-delete': [
    'declare const a: number[]; delete a[0];',
    'declare const a: Record<string, number>; delete a.x;',
    'declare const a: readonly number[]; delete a[0];',
  ],
  'no-base-to-string': [
    'declare const a: {}; String(a);',
    'String(1);',
    'declare const a: { toString(): string }; String(a);',
    'declare const a: object | string; `${a}`;',
  ],
  'no-confusing-void-expression': [
    'declare function f(): void; const a = f();',
    'declare function f(): number; const a = f();',
    'declare function f(): void; f();',
  ],
  'no-deprecated': [
    '/** @deprecated Use bar. */ declare function foo(): void;\nfoo();',
    // Only the string overload is deprecated, which the shared symbol's tags
    // cannot distinguish; the signature's own declaration can.
    'declare function o(a: string): void;\n/** @deprecated */ declare function o(a: number): void;\no("a");\no(1);',
    "import { exists } from 'fs';\nexists('/foo', () => {});",
    // `@types/node` wraps `fs` in a `declare module` block, which matches
    // before any package name lookup happens. See `only-throw-error` for the
    // case that reaches `Program#sourceFileToPackageName`.
    {
      code: "import { exists } from 'fs';\nexists('/foo', () => {});",
      options: [
        { allow: [{ from: 'package', name: 'exists', package: 'fs' }] },
      ],
    },
    '/** @deprecated */ declare const a: number;\na;',
    'declare function foo(): void;\nfoo();',
    '/** @deprecated */ interface I { a: number }\ndeclare const i: I;',
  ],
  'no-floating-promises': [
    'declare function f(): Promise<void>; f();',
    'declare function f(): Promise<void>; void f();',
    'declare function f(): Promise<void>; f().catch(() => {});',
    'declare const p: Promise<void> | number; p;',
  ],
  'no-for-in-array': [
    'declare const a: number[]; for (const k in a) {}',
    'declare const a: [string, number]; for (const k in a) {}',
    'declare const a: object; for (const k in a) {}',
    'declare const a: readonly string[]; for (const k in a) {}',
  ],
  'no-misused-promises': [
    'declare const p: Promise<boolean>; if (p) {}',
    // Reaches `getContextualTypeForArgumentAtIndex`, which is approximated.
    // Each overload order is covered because the resolved signature and the
    // contextual type pick different ones.
    "interface ItLike {\n  (name: string, cb: () => Promise<void>): void;\n  (name: string, cb: () => void): void;\n}\ndeclare const it: ItLike;\nit('', async () => {});",
    "interface ItLike {\n  (name: string, cb: () => void): void;\n  (name: string, cb: () => Promise<void>): void;\n}\ndeclare const it: ItLike;\nit('', async () => {});",
    "interface ItLike {\n  (name: string, cb: () => void): void;\n}\ndeclare const it: ItLike;\nit('', async () => {});",
    'declare function f(cb: () => void): void; f(async () => {});',
    'declare const b: boolean; if (b) {}',
  ],
  'no-misused-spread': [
    'class C {}\nconst a = { ...C };',
    'declare const c: { a: number };\nconst a = { ...c };',
    'declare function f<T extends object>(t: T): void;\ndeclare const g: <T extends object>(t: T) => void;\nconst a = { ...g<{ x: 1 }> };',
    'declare const s: string;\nconst a = [...s];',
    'declare function rest<T extends object>(t: T): void;\nfunction h<T extends object>(t: T) { const { ...r } = t; return { ...r }; }',
  ],
  'no-mixed-enums': [
    'enum E { A = 1, B = "b" }',
    'enum E { A = 1, B = 2 }',
    'enum E { A = "a", B = "b" }',
    'enum E { A, B = "b" }',
  ],
  'no-unnecessary-condition': [
    'declare const a: string; if (a) {}',
    'declare const a: string | undefined; if (a) {}',
    'declare const a: { b?: number }; a.b?.toFixed();',
    'declare const a: number[]; if (a) {}',
  ],
  'no-unnecessary-qualifier': [
    'namespace N {\n  export type T = number;\n  declare const x: N.T;\n}',
    'namespace N {\n  export type T = number;\n}\ndeclare const x: N.T;',
    'enum E {\n  A,\n}\nnamespace E {\n  declare const a: E.A;\n}',
  ],
  'no-unnecessary-type-arguments': [
    'declare function f<T = number>(): T; f<number>();',
    'declare function f<T = number>(): T; f<string>();',
    'class C<T = number> {}\nnew C<number>();',
  ],
  'no-unnecessary-type-assertion': [
    'const a = 1 as number;',
    'declare const a: unknown; const b = a as number;',
    'declare const a: string | undefined; const b = a!;',
    'declare const a: string; const b = a!;',
  ],
  'no-unsafe-argument': [
    'declare function f(x: number): void; declare const a: any; f(a);',
    'declare function f(x: number): void; f(1);',
    'declare function f(...xs: number[]): void; declare const a: any[]; f(...a);',
    'declare function f(...xs: number[]): void; declare const a: string[]; f(...a);',
    'declare function f(...xs: [number, string]): void; declare const a: any; f(1, a);',
    // An array rest parameter reaches `getIndexTypeOfType`, which the native
    // API has no equivalent for. The reported parameter type is the element
    // type rather than the array type.
    'declare function f(...xs: number[]): void; declare const a: any; f(a);',
  ],
  'no-unsafe-assignment': [
    'declare const a: any; const b: number = a;',
    'const a: number = 1;',
    'declare const a: any[]; const b: number[] = a;',
  ],
  'no-unsafe-return': [
    'declare const a: any; function f(): number { return a; }',
    'function f(): number { return 1; }',
    'declare const a: any; async function f(): Promise<number> { return a; }',
  ],
  'no-unsafe-unary-minus': [
    'declare const a: string; -a;',
    '-1;',
    'declare const a: number; -a;',
    'declare const a: bigint; -a;',
    'declare const a: number | string; -a;',
  ],
  'only-throw-error': [
    "import { SemVer } from 'semver';\ndeclare const v: SemVer;\nthrow v;",
    // `@types/semver` is a plain module rather than a `declare module` block,
    // so matching this specifier has to go through
    // `Program#sourceFileToPackageName`, which has no native API.
    {
      code: "import { SemVer } from 'semver';\ndeclare const v: SemVer;\nthrow v;",
      options: [
        { allow: [{ from: 'package', name: 'SemVer', package: 'semver' }] },
      ],
    },
  ],
  'prefer-nullish-coalescing': [
    'declare const a: string | undefined; a || "b";',
    'declare const a: string | undefined; a ?? "b";',
    'declare const a: boolean; a || false;',
  ],
  'prefer-readonly-parameter-types': [
    'function f(x: { [k: string]: number }) {}',
    'function f(x: { readonly [k: string]: number }) {}',
    'function f(x: { readonly [k: number]: string }) {}',
    'function f(x: { a: number }) {}',
    'function f(x: { readonly a: number }) {}',
    'function f(x: readonly number[]) {}',
  ],
  'prefer-reduce-type-parameter': [
    'declare const a: number[]; a.reduce((acc, x) => acc.concat(x), [] as number[]);',
    'declare const a: number[]; a.reduce<number[]>((acc, x) => acc.concat(x), []);',
  ],
  'prefer-string-starts-ends-with': [
    'declare const a: string; a.indexOf("b") === 0;',
    'declare const a: string; a.startsWith("b");',
  ],
  'require-array-sort-compare': [
    'declare const a: number[]; a.sort();',
    'declare const a: number[]; a.sort((x, y) => x - y);',
    'declare const a: string[]; a.sort();',
  ],
  'restrict-plus-operands': [
    'declare const a: number; declare const b: object; a + b;',
    '1 + 2;',
    '"a" + "b";',
    'declare const a: number; declare const b: string; a + b;',
    'declare const a: bigint; declare const b: number; a + b;',
  ],
  'restrict-template-expressions': [
    'declare const a: object; `${a}`;',
    'declare const a: string; `${a}`;',
    '`${1}`;',
    'declare const a: never; `${a}`;',
  ],
  'strict-boolean-expressions': [
    'declare const a: string; if (a) {}',
    'declare const a: boolean; if (a) {}',
    'declare const a: number | undefined; if (a) {}',
  ],
  'switch-exhaustiveness-check': [
    'declare const a: "x" | "y"; switch (a) { case "x": break; }',
    'declare const a: "x" | "y"; switch (a) { case "x": break; case "y": break; }',
  ],
  'unbound-method': [
    'class C { m() {} }\ndeclare const c: C;\nconst m = c.m;',
    'class C { m = () => {} }\ndeclare const c: C;\nconst m = c.m;',
  ],
};

describe('TypeScript 7.1 native backend rule parity', () => {
  describe.each(Object.entries(CASES) as [RuleName, (string | Case)[]][])(
    '%s',
    (ruleName, cases) => {
      it.for(cases)('%j', rawCase => {
        const testCase =
          typeof rawCase === 'string' ? { code: rawCase } : rawCase;
        expect(lint(ruleName, testCase, true)).toStrictEqual(
          lint(ruleName, testCase, false),
        );
      });
    },
  );
});
