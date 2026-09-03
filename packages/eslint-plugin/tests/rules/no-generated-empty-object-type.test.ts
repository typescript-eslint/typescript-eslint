import rule from '../../src/rules/no-generated-empty-object-type';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-generated-empty-object-type', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
type Data = { name: string; num: number };
type Expected = Omit<Data, 'name'>;
    `,
    `
type Data = { name: string; num: number };
declare function doSomething<T extends Omit<Data, 'name'>>(param: T): void;
    `,
    `
type Names = Array<string>;
    `,
    `
type Empty = {};
    `,
    `
type Explicit = {} | { value: number };
    `,
    `
interface Empty {}
type Alias = Empty;
    `,
    `
class Empty {}
type Alias = Empty;
    `,
    `
type Dictionary = Record<string, never>;
    `,
    `
type Callable = () => void;
type Aliased = Exclude<Callable, undefined>;
    `,
    `
type Data = { name: string; num: number };
type NullableData = null | Data;
type Intersected = Omit<NullableData, 'name'> & { other: string };
    `,
    `
type Data = { name: string; value: number };
type Data2 = { name: string };
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
type Expected = DistributiveOmit<Data | Data2, 'name'> & {
  other: string;
};
    `,
    `
declare function getEnumNames<T extends string>(
  myEnum: Record<T, unknown>,
): T[];
    `,
    `
type MakeRequired<Base, Key extends keyof Base> = Omit<Base, Key> &
  Required<Record<Key, NonNullable<Base[Key]>>>;
    `,
    `
type Emptied<T> = Omit<T, keyof T>;
    `,
  ],
  invalid: [
    {
      code: `
type Data = { name: string; num: number };
type NullableData = null | Data;
type Unexpected = Omit<NullableData, 'name'>;
      `,
      errors: [
        {
          column: 19,
          endColumn: 45,
          endLine: 4,
          line: 4,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { name: string; num: number };
type NullableData = null | Data;
function doSomething<T extends Omit<NullableData, 'name'>>(param: T) {}
      `,
      errors: [
        {
          column: 32,
          endColumn: 58,
          endLine: 4,
          line: 4,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { name: string; num: number };
type Unexpected = Pick<Data, never>;
      `,
      errors: [
        {
          column: 19,
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Unexpected = NonNullable<unknown>;
      `,
      errors: [
        {
          column: 19,
          endColumn: 39,
          endLine: 2,
          line: 2,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { name: string; num: number };
type NullableData = null | Data;
declare const unexpected: Omit<NullableData, 'name'>;
      `,
      errors: [
        {
          column: 27,
          endColumn: 53,
          endLine: 4,
          line: 4,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { name: string; num: number };
type NullableData = null | Data;
type Unexpected = Omit<NullableData, 'name'>;
type Referencing = Unexpected;
      `,
      errors: [
        {
          column: 19,
          endColumn: 45,
          endLine: 4,
          line: 4,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { name: string; num: number };
type NullableData = null | Data;
type Unexpected = Array<Omit<NullableData, 'name'>>;
      `,
      errors: [
        {
          column: 25,
          endColumn: 51,
          endLine: 4,
          line: 4,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { name: string; value: number };
type Data2 = { name: string };
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;
type Unexpected = DistributiveOmit<Data | Data2, 'name'>;
      `,
      errors: [
        {
          column: 19,
          endColumn: 57,
          endLine: 7,
          line: 7,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
    {
      code: `
type Data = { a: string };
type Unexpected = Omit<Data, 'a'> & Omit<Data, 'a'>;
      `,
      errors: [
        {
          column: 19,
          endColumn: 52,
          endLine: 3,
          line: 3,
          messageId: 'noGeneratedEmptyObjectType',
        },
      ],
    },
  ],
});
