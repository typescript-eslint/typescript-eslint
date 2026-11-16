import * as path from 'node:path';

import rule from '../../src/rules/no-misleading-return-type';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-misleading-return-type', rule, {
  valid: [
    `
function getValue() {
  return 'value';
}
    `,
    `
function getValue(): string {
  return 'value';
}
    `,
    `
function getValue(flag: boolean): string | null {
  if (flag) {
    return null;
  }
  return 'value';
}
    `,
    `
function getValue<T extends string | null>(value: T): string | null {
  return value;
}
    `,
    `
function getValue<T>(
  flag: boolean,
): (T extends unknown ? undefined : never) | string {
  if (flag) {
    return 'value';
  }
  return;
}
    `,
    `
function getValue(flag: boolean): \`value-\${string}\` | 'fallback' {
  return flag ? 'value-ready' : 'fallback';
}
    `,
    `
function getValue<T extends { key?: string }>(value: T): T | Required<T> {
  return value;
}
    `,
    `
function createValue(): { left: string } | { right: number } {
  return { left: 'value', right: 1 };
}
    `,
    `
declare const value: string;
function getValue(): string | 'value' {
  return value;
}
    `,
    `
function getValue(flag: boolean): 'ready' | 'idle' | string | null {
  return flag ? 'ready' : null;
}
    `,
    `
function getValue(flag: boolean): true | boolean | null {
  return flag ? false : null;
}
    `,
    `
type BooleanResult = boolean | 'fallback';
function getValue(flag: boolean): true | BooleanResult | null {
  return flag ? false : null;
}
    `,
    `
declare const result: string | null;
function getValue(): string | null {
  return result;
}
    `,
    `
type Result = string | null;
function getValue(): Result {
  return 'value';
}
    `,
    `
function getValue(): string | null {
  throw new Error('unreachable');
}
    `,
    `
function getValue(): string | null {
  return JSON.parse('"value"');
}
    `,
    `
function getValue(flag: boolean): string | undefined {
  if (flag) {
    return 'value';
  }
}
    `,
    `
declare const value: unknown;
function getValue(): unknown | string {
  return value;
}
    `,
    `
function getValue(): string | never {
  return 'value';
}
    `,
    `
function getValue(): string | any {
  return 1;
}
    `,
    `
declare function fail(): never;
function getValue(): string | null {
  return fail();
}
    `,
    `
function getValue(flag: boolean): string | void {
  if (flag) {
    return 'value';
  }
  return;
}
    `,
    `
function getValue(flag: boolean): string | undefined {
  if (flag) {
    return;
  }
  return 'value';
}
    `,
    `
type TextValue = string;
function getValue(): string | TextValue {
  return 'value';
}
    `,
    `
function isTextValue(value: unknown): value is string | number {
  return typeof value === 'string';
}
    `,
    // Without strictNullChecks, every type already includes null and undefined.
    {
      code: `
function getValue(): string | null | undefined {
  return 'value';
}
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootDir, 'unstrict'),
        },
      },
    },
  ],
  invalid: [
    {
      code: `
class Provider {
  accessor getValue = (): string | null => 'value';
}
      `,
      // `accessor` keyword requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [
        {
          column: 36,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Provider {
  getValue = (): string | null => 'value';
}
      `,
      errors: [
        {
          column: 27,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | null {
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | (number | null) {
  return 1;
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
        {
          column: 41,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Values {
  static getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Values {
  getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: "const getValue = (): string | null => 'value';",
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const getValue = function (): string | null {
  return 'value';
};
      `,
      errors: [
        {
          column: 40,
          endColumn: 44,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): 'ready' | 'idle' {
  return 'ready';
}
      `,
      errors: [
        {
          column: 32,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): 'ready' | string | null {
  return null;
}
      `,
      errors: [
        {
          column: 32,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): true | boolean | null {
  return null;
}
      `,
      errors: [
        {
          column: 29,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createValue(): { kind: 'ready' } | { kind: 'idle' } {
  return { kind: 'ready' };
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 61,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const missing: unique symbol;
function getValue(): object | typeof missing {
  return {};
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
type TextValue = string;
type MissingValue = null;
function getValue(): TextValue | MissingValue {
  return 'value';
}
      `,
      errors: [
        {
          column: 34,
          endColumn: 46,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: T): T | null {
  return value;
}
      `,
      errors: [
        {
          column: 37,
          endColumn: 41,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(values: Map<string, T>, key: string): T | null {
  return values.get(key)!;
}
      `,
      errors: [
        {
          column: 64,
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string | null>(value: T): string | null | number {
  return value;
}
      `,
      errors: [
        {
          column: 71,
          endColumn: 77,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string>(value: null): \`\${T}\` | null {
  return value;
}
      `,
      errors: [
        {
          column: 51,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): \`value-\${string}\` | 'fallback' {
  return 'fallback';
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 39,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: null): (T extends string ? string : number) | null {
  return value;
}
      `,
      errors: [
        {
          column: 37,
          endColumn: 71,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: {
  key: string;
}): (T extends string ? string : number) | { key: string } {
  return value;
}
      `,
      errors: [
        {
          column: 6,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends object, U>(
  value: T,
): T | (U extends string ? string : number) {
  return value;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string>(value: null): Uppercase<T> | null {
  return value;
}
      `,
      errors: [
        {
          column: 51,
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): boolean | null {
  return true;
}
      `,
      errors: [
        {
          column: 32,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const values = {
  getValue(): string | null {
    return 'value';
  },
};
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const values = {
  get current(): string | null {
    return 'value';
  },
};
      `,
      errors: [
        {
          column: 27,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | null {
  function getFallback(): null {
    return null;
  }
  getFallback;
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const result: string | number;
function getValue(): string | number | null {
  return result;
}
      `,
      errors: [
        {
          column: 40,
          endColumn: 44,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string | number>(
  value: T,
): T | (T extends string ? string : number) {
  return value;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string>(value: T): T | \`\${T}\` {
  return value;
}
      `,
      errors: [
        {
          column: 52,
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: T & string): \`\${T & string}\` | (T & string) {
  return value;
}
      `,
      errors: [
        {
          column: 42,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends 'A' | 'B'>(value: T): T | Uppercase<T> {
  return value;
}
      `,
      errors: [
        {
          column: 55,
          endColumn: 67,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: {
  right: true;
}): (T extends string ? { left: true } : { other: true }) | { right: true } {
  return value;
}
      `,
      errors: [
        {
          column: 6,
          endColumn: 57,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends { right: true }, U>(
  value: T,
): T | (U extends string ? { left: true } : { other: true }) {
  return value;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 60,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T, U>(value: T): T | (U extends string ? string : number) {
  return value;
}
      `,
      errors: [
        {
          column: 41,
          endColumn: 75,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
enum AllowedType {
  Number,
  String,
  Unknown,
}
enum TypeFlags {
  Unknown = 2,
}
declare function getAllowedType(): AllowedType;
function getValue(): AllowedType | TypeFlags.Unknown | undefined {
  return getAllowedType();
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 53,
          endLine: 11,
          line: 11,
          messageId: 'unnecessaryType',
        },
        {
          column: 56,
          endColumn: 65,
          endLine: 11,
          line: 11,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
enum FirstText {
  Value = 'value',
}
enum SecondText {
  Value = 'value',
}
function getText(): FirstText.Value | SecondText.Value {
  return FirstText.Value;
}
      `,
      errors: [
        {
          column: 39,
          endColumn: 55,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends undefined>(): string | T {
  return 'value';
}
      `,
      errors: [
        {
          column: 52,
          endColumn: 53,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | undefined {
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(flag: boolean): string | undefined {
  if (flag) {
    return 'value';
  }
  throw new Error('message');
}
      `,
      errors: [
        {
          column: 44,
          endColumn: 53,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | void {
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
type TextValue = string;
function getValue(): string | TextValue | null {
  return null;
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
        {
          column: 31,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Config {
  name: string;
}
function getKey(): keyof Config | null {
  return 'name';
}
      `,
      errors: [
        {
          column: 35,
          endColumn: 39,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryType',
        },
      ],
    },
  ],
});
