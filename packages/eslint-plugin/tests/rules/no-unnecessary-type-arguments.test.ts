import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unnecessary-type-arguments';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('no-unnecessary-type-arguments', rule, {
  valid: [
    'f<>();',
    'f<string>();',
    'expect().toBe<>();',
    'class Foo extends Bar<> {}',
    'class Foo extends Bar<string> {}',
    'class Foo implements Bar<> {}',
    'class Foo implements Bar<string> {}',
    `
function f<T = number>() {}
f();
    `,
    `
function f<T = number>() {}
f<string>();
    `,
    `
declare const f: (<T = number>() => void) | null;
f?.();
    `,
    `
declare const f: (<T = number>() => void) | null;
f?.<string>();
    `,
    `
declare const f: any;
f();
    `,
    `
declare const f: any;
f<string>();
    `,
    `
declare const f: unknown;
f();
    `,
    `
declare const f: unknown;
f<string>();
    `,
    `
function g<T = number, U = string>() {}
g<number, number>();
    `,
    `
declare const g: any;
g<string, string>();
    `,
    `
declare const g: unknown;
g<string, string>();
    `,
    `
declare const f: unknown;
f<string>\`\`;
    `,
    `
function f<T = number>(template: TemplateStringsArray) {}
f<string>\`\`;
    `,
    `
class C<T = number> {}
new C<string>();
    `,
    `
declare const C: any;
new C<string>();
    `,
    `
declare const C: unknown;
new C<string>();
    `,
    `
class C<T = number> {}
class D extends C<string> {}
    `,
    `
declare const C: any;
class D extends C<string> {}
    `,
    `
declare const C: unknown;
class D extends C<string> {}
    `,
    `
interface I<T = number> {}
class Impl implements I<string> {}
    `,
    `
class C<TC = number> {}
class D<TD = number> extends C {}
    `,
    `
declare const C: any;
class D<TD = number> extends C {}
    `,
    `
declare const C: unknown;
class D<TD = number> extends C {}
    `,
    'let a: A<number>;',
    `
class Foo<T> {}
const foo = new Foo<number>();
    `,
    "type Foo<T> = import('foo').Foo<T>;",
    `
class Bar<T = number> {}
class Foo<T = number> extends Bar<T> {}
    `,
    `
interface Bar<T = number> {}
class Foo<T = number> implements Bar<T> {}
    `,
    `
class Bar<T = number> {}
class Foo<T = number> extends Bar<string> {}
    `,
    `
interface Bar<T = number> {}
class Foo<T = number> implements Bar<string> {}
    `,
    `
import { F } from './missing';
function bar<T = F>() {}
bar<F<number>>();
    `,
    `
type A<T = Element> = T;
type B = A<HTMLInputElement>;
    `,
    `
type A<T = Map<string, string>> = T;
type B = A<Map<string, number>>;
    `,
    `
type A = Map<string, string>;
type B<T = A> = T;
type C2 = B<Map<string, number>>;
    `,
    `
interface Foo<T = string> {}
declare var Foo: {
  new <T>(type: T): any;
};
class Bar extends Foo<string> {}
    `,
    `
interface Foo<T = string> {}
class Foo<T> {}
class Bar extends Foo<string> {}
    `,
    `
class Foo<T = string> {}
interface Foo<T> {}
class Bar implements Foo<string> {}
    `,
    `
class Foo<T> {}
namespace Foo {
  export class Bar {}
}
class Bar extends Foo<string> {}
    `,
    {
      code: `
function Button<T>() {
  return <div></div>;
}
const button = <Button<string>></Button>;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
    {
      code: `
function Button<T>() {
  return <div></div>;
}
const button = <Button<string> />;
      `,
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },
  ],
  invalid: [
    {
      code: `
function f<T = number>() {}
f<number>();
      `,
      errors: [
        {
          column: 3,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
function f<T = number>() {}
f();
      `,
    },
    {
      code: `
function g<T = number, U = string>() {}
g<string, string>();
      `,
      errors: [
        {
          column: 11,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
function g<T = number, U = string>() {}
g<string>();
      `,
    },
    {
      code: `
function f<T = number>(templates: TemplateStringsArray, arg: T) {}
f<number>\`\${1}\`;
      `,
      errors: [
        {
          column: 3,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
function f<T = number>(templates: TemplateStringsArray, arg: T) {}
f\`\${1}\`;
      `,
    },
    {
      code: `
class C<T = number> {}
function h(c: C<number>) {}
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class C<T = number> {}
function h(c: C) {}
      `,
    },
    {
      code: `
class C<T = number> {}
new C<number>();
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class C<T = number> {}
new C();
      `,
    },
    {
      code: `
class C<T = number> {}
class D extends C<number> {}
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class C<T = number> {}
class D extends C {}
      `,
    },
    {
      code: `
interface I<T = number> {}
class Impl implements I<number> {}
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
interface I<T = number> {}
class Impl implements I {}
      `,
    },
    {
      code: `
class Foo<T = number> {}
const foo = new Foo<number>();
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class Foo<T = number> {}
const foo = new Foo();
      `,
    },
    {
      code: `
interface Bar<T = string> {}
class Foo<T = number> implements Bar<string> {}
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
interface Bar<T = string> {}
class Foo<T = number> implements Bar {}
      `,
    },
    {
      code: `
class Bar<T = string> {}
class Foo<T = number> extends Bar<string> {}
      `,
      errors: [
        {
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class Bar<T = string> {}
class Foo<T = number> extends Bar {}
      `,
    },
    {
      code: `
import { F } from './missing';
function bar<T = F<string>>() {}
bar<F<string>>();
      `,
      errors: [
        {
          column: 5,
          line: 4,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
import { F } from './missing';
function bar<T = F<string>>() {}
bar();
      `,
    },
    {
      code: `
type DefaultE = { foo: string };
type T<E = DefaultE> = { box: E };
type G = T<DefaultE>;
declare module 'bar' {
  type DefaultE = { somethingElse: true };
  type G = T<DefaultE>;
}
      `,
      errors: [
        {
          column: 12,
          line: 4,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
type DefaultE = { foo: string };
type T<E = DefaultE> = { box: E };
type G = T;
declare module 'bar' {
  type DefaultE = { somethingElse: true };
  type G = T<DefaultE>;
}
      `,
    },
    {
      code: `
type A<T = Map<string, string>> = T;
type B = A<Map<string, string>>;
      `,
      errors: [
        {
          line: 3,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
type A<T = Map<string, string>> = T;
type B = A;
      `,
    },
    {
      code: `
type A = Map<string, string>;
type B<T = A> = T;
type C = B<A>;
      `,
      errors: [
        {
          line: 4,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
type A = Map<string, string>;
type B<T = A> = T;
type C = B;
      `,
    },
    {
      code: `
type A = Map<string, string>;
type B<T = A> = T;
type C = B<Map<string, string>>;
      `,
      errors: [
        {
          line: 4,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
type A = Map<string, string>;
type B<T = A> = T;
type C = B;
      `,
    },
    {
      code: `
type A = Map<string, string>;
type B = Map<string, string>;
type C<T = A> = T;
type D = C<B>;
      `,
      errors: [
        {
          line: 5,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
type A = Map<string, string>;
type B = Map<string, string>;
type C<T = A> = T;
type D = C;
      `,
    },
    {
      code: `
type A = Map<string, string>;
type B = A;
type C = Map<string, string>;
type D = C;
type E<T = B> = T;
type F = E<D>;
      `,
      errors: [
        {
          line: 7,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
type A = Map<string, string>;
type B = A;
type C = Map<string, string>;
type D = C;
type E<T = B> = T;
type F = E;
      `,
    },
    {
      code: `
interface Foo {}
declare var Foo: {
  new <T = string>(type: T): any;
};
class Bar extends Foo<string> {}
      `,
      errors: [
        {
          line: 6,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
interface Foo {}
declare var Foo: {
  new <T = string>(type: T): any;
};
class Bar extends Foo {}
      `,
    },
    {
      code: `
declare var Foo: {
  new <T = string>(type: T): any;
};
interface Foo {}
class Bar extends Foo<string> {}
      `,
      errors: [
        {
          line: 6,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
declare var Foo: {
  new <T = string>(type: T): any;
};
interface Foo {}
class Bar extends Foo {}
      `,
    },
    {
      code: `
class Foo<T> {}
interface Foo<T = string> {}
class Bar implements Foo<string> {}
      `,
      errors: [
        {
          line: 4,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class Foo<T> {}
interface Foo<T = string> {}
class Bar implements Foo {}
      `,
    },
    {
      code: `
class Foo<T = string> {}
namespace Foo {
  export class Bar {}
}
class Bar extends Foo<string> {}
      `,
      errors: [
        {
          line: 6,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      output: `
class Foo<T = string> {}
namespace Foo {
  export class Bar {}
}
class Bar extends Foo {}
      `,
    },
    {
      code: `
function Button<T = string>() {
  return <div></div>;
}
const button = <Button<string>></Button>;
      `,
      errors: [
        {
          line: 5,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      output: `
function Button<T = string>() {
  return <div></div>;
}
const button = <Button></Button>;
      `,
    },
    {
      code: `
function Button<T = string>() {
  return <div></div>;
}
const button = <Button<string> />;
      `,
      errors: [
        {
          line: 5,
          messageId: 'unnecessaryTypeParameter',
        },
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      output: `
function Button<T = string>() {
  return <div></div>;
}
const button = <Button />;
      `,
    },
  ],
});
