/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import {
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import { RuleTester } from '../../RuleTester';
import rule from '../../../src/rules/indent';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

/**
 * Marks a test case as a plain javascript case which should be indented the same
 */
function nonTsTestCase(example: TemplateStringsArray): string {
  return [`// Non-TS Test Case`, example].join('\n');
}

const individualNodeTests = [
  {
    node: AST_NODE_TYPES.ClassDeclaration,
    code: [
      `
abstract class Foo {
    constructor() {}
    method() {
        console.log('hi');
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSAbstractClassProperty,
    code: [
      `
class Foo {
    abstract bar : baz;
    abstract foo : {
        a : number
        b : number
    };
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSAbstractMethodDefinition,
    code: [
      `
class Foo {
    abstract bar() : baz;
    abstract foo() : {
        a : number
        b : number
    };
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSArrayType,
    code: [
      `
type foo = ArrType[];
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSAsExpression,
    code: [
      `
const foo = {} as {
    foo: string,
    bar: number,
};
            `,
      nonTsTestCase`
const foo = {} ===
{
    foo: string,
    bar: number,
};
            `,
      `
const foo = {} as
{
    foo: string,
    bar: number,
};
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSConditionalType,
    code: [
      nonTsTestCase`
const Foo = T
    ? {
        a: number,
        b: boolean
    }
    : {
        c: string
    };
            `,
      `
type Foo<T> = T extends string
    ? {
        a: number,
        b: boolean
    }
    : {
        c: string
    };
            `,
      nonTsTestCase`
const Foo = T ? {
    a: number,
    b: boolean
} : string;
            `,
      `
type Foo<T> = T extends string ? {
    a: number,
    b: boolean
} : string;
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSConstructorType,
    code: [
      `
type Constructor<T> = new (
    ...args: any[]
) => T;
            `,
    ],
  },
  {
    node: 'TSConstructSignature',
    code: [
      `
interface Foo {
    new () : Foo
    new () : {
        bar : string
        baz : string
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSDeclareFunction,
    code: [
      `
declare function foo() : {
    bar : number,
    baz : string,
};
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
    code: [
      `
class Foo {
    constructor(
        a : string,
        b : {
            c : number
        }
    )
}
            `,
    ],
  },
  {
    node: 'TSEnumDeclaration, TSEnumMember',
    code: [
      `
enum Foo {
    bar = 1,
    baz = 1,
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSExportAssignment,
    code: [
      `
export = {
    a: 1,
    b: 2,
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSFunctionType,
    code: [
      `
const foo: () => void = () => ({
    a: 1,
    b: 2,
});
            `,
      `
const foo: () => {
    a: number,
    b: number,
} = () => ({
    a: 1,
    b: 2,
});
            `,
      `
const foo: ({
    a: number,
    b: number,
}) => void = (arg) => ({
    a: 1,
    b: 2,
});
            `,
      `
const foo: ({
    a: number,
    b: number,
}) => {
    a: number,
    b: number,
} = (arg) => ({
    a: arg.a,
    b: arg.b,
});
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSImportType,
    code: [
      `
const foo: import("bar") = {
    a: 1,
    b: 2,
};
            `,
      `
const foo: import(
    "bar"
) = {
    a: 1,
    b: 2,
};
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSIndexedAccessType,
    code: [
      nonTsTestCase`
const Foo = Bar[
    'asdf'
];
            `,
      `
type Foo = Bar[
    'asdf'
];
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSIndexSignature,
    code: [
      `
type Foo = {
    [a : string] : {
        x : foo
        [b : number] : boolean
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSInferType,
    code: [
      `
type Foo<T> = T extends string
    ? infer U
    : {
        a : string
    };
            `,
    ],
  },
  {
    node: 'TSInterfaceBody, TSInterfaceDeclaration',
    code: [
      `
interface Foo {
    a : string
    b : {
        c : number
        d : boolean
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSInterfaceHeritage,
    code: [
      `
interface Foo extends Bar {
    a : string
    b : {
        c : number
        d : boolean
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSIntersectionType,
    code: [
      `
type Foo = "string" & {
    a : number
} & number;
            `,
    ],
  },
  {
    node: 'TSImportEqualsDeclaration, TSExternalModuleReference',
    code: [
      nonTsTestCase`
const foo = require(
    'asdf'
);
            `,
      `
import foo = require(
    'asdf'
);
            `,
    ],
  },
  // TSLiteralType
  {
    node: AST_NODE_TYPES.TSMappedType,
    code: [
      `
type Partial<T> = {
    [P in keyof T]: T[P];
}
            `,
      `
// TSQuestionToken
type Partial<T> = {
    [P in keyof T]?: T[P];
}
            `,
      `
// TSPlusToken
type Partial<T> = {
    [P in keyof T]+?: T[P];
}
            `,
      `
// TSMinusToken
type Partial<T> = {
    [P in keyof T]-?: T[P];
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSMethodSignature,
    code: [
      `
interface Foo {
    method() : string
    method2() : {
        a : number
        b : string
    }
}
            `,
    ],
  },
  // TSMinusToken - tested in TSMappedType
  {
    node: 'TSModuleBlock, TSModuleDeclaration',
    code: [
      `
declare module "foo" {
    export const bar : {
        a : string,
        b : number,
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSNonNullExpression,
    code: [
      nonTsTestCase`
const foo = a
    .b.
    c;
            `,
      `
const foo = a!
    .b!.
    c;
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSParameterProperty,
    code: [
      `
class Foo {
    constructor(
        private foo : string,
        public bar : {
            a : string,
            b : number,
        }
    ) {
        console.log('foo')
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSParenthesizedType,
    code: [
      `
const x: Array<(
    | {
        __typename: "Foo",
    }
    | {
        __typename: "Baz",
    }
    | (
        | {
            __typename: "Baz",
        }
        | {
            __typename: "Buzz",
        }
    )
)>;
            `,
    ],
  },
  // TSPlusToken - tested in TSMappedType
  {
    node: AST_NODE_TYPES.TSPropertySignature,
    code: [
      `
interface Foo {
    bar : string
    baz : {
        a : string
        b : number
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSQualifiedName,
    code: [
      `
const a: Foo.bar = {
    a: 1,
    b: 2,
};
            `,
      nonTsTestCase`
const a = Foo.
    bar
    .baz = {
        a: 1,
        b: 2,
    };
            `,
      `
const a: Foo.
    bar
    .baz = {
        a: 1,
        b: 2,
    };
            `,
    ],
  },
  // TSQuestionToken - tested in TSMappedType
  {
    node: AST_NODE_TYPES.TSRestType,
    code: [
      `
type foo = [
    string,
    ...string[],
];
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSThisType,
    code: [
      `
declare class MyArray<T> extends Array<T> {
    sort(compareFn?: (a: T, b: T) => number): this;
    meth() : {
        a: number,
    }
}
            `,
    ],
  },
  {
    node: AST_NODE_TYPES.TSTupleType,
    code: [
      nonTsTestCase`
const foo = [
    string,
    number,
];
            `,
      `
type foo = [
    string,
    number,
];
            `,
      nonTsTestCase`
const foo = [
    [
        string,
        number,
    ],
];
            `,
      `
type foo = [
    [
        string,
        number,
    ],
];
            `,
    ],
  },
  // TSTypeAnnotation - tested in everything..
  // TSTypeLiteral - tested in everything..
  {
    node: AST_NODE_TYPES.TSTypeOperator,
    code: [
      `
type T = keyof {
    a: 1,
    b: 2,
};
            `,
    ],
  },
  {
    node: 'TSTypeParameter, TSTypeParameterDeclaration',
    code: [
      `
type Foo<T> = {
    a : unknown,
    b : never,
}
            `,
      `
function foo<
    T,
    U
>() {
    console.log('');
}
            `,
    ],
  },
  // TSTypeReference - tested in everything..
  {
    node: AST_NODE_TYPES.TSUnionType,
    code: [
      `
type Foo = string | {
    a : number
} | number;
            `,
    ],
  },
].reduce<TSESLint.RunTests<MessageIds, Options>>(
  (acc, testCase) => {
    const indent = '    ';

    const validCases = [...acc.valid];
    const invalidCases = [...acc.invalid];

    const codeCases = testCase.code.map(code =>
      [
        '', // newline to make test error messages nicer
        `// ${testCase.node}`, // add comment to easily identify which node a test belongs to
        code.trim(), // remove leading/trailing spaces from the case
      ].join('\n'),
    );

    codeCases.forEach(code => {
      // valid test case is just the code
      validCases.push(code);

      const invalid = {
        // test the fixer by removing all the spaces
        code: code.replace(new RegExp(indent, 'g'), ''),
        output: code,
        errors: code
          .split('\n')
          .map<TSESLint.TestCaseError<MessageIds> | null>((line, lineNum) => {
            const indentCount = line.split(indent).length - 1;
            const spaceCount = indentCount * indent.length;

            if (indentCount < 1) {
              return null;
            }

            return {
              messageId: 'wrongIndentation',
              data: {
                expected: `${spaceCount} spaces`,
                actual: 0,
              },
              line: lineNum + 1,
              column: 1,
            };
          })
          .filter(
            (error): error is TSESLint.TestCaseError<MessageIds> =>
              error !== null,
          ),
      };
      if (invalid.errors.length > 0) {
        invalidCases.push(invalid);
      }
    });

    return { ...acc, valid: validCases, invalid: invalidCases };
  },
  { valid: [], invalid: [] },
);

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('indent', rule, {
  valid: [
    ...individualNodeTests.valid,
    `
@Component({
    components: {
        ErrorPage: () => import('@/components/ErrorPage.vue'),
    },
    head: {
        titleTemplate(title) {
            if (title) {
                return \`test\`
            }
            return 'Title'
        },
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
    },
})
export default class App extends Vue
{
    get error()
    {
        return this.$store.state.errorHandler.error
    }
}
    `,
    // https://github.com/eslint/typescript-eslint-parser/issues/474
    `
/**
 * @param {string} name
 * @param {number} age
 * @returns {string}
 */
function foo(name: string, age: number): string {}
    `,
    `
const firebaseApp = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp({
        apiKey: __FIREBASE_API_KEY__,
        authDomain: __FIREBASE_AUTH_DOMAIN__,
        databaseURL: __FIREBASE_DATABASE_URL__,
        projectId: __FIREBASE_PROJECT_ID__,
        storageBucket: __FIREBASE_STORAGE_BUCKET__,
        messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
    })
    `,
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/271
    {
      code: `
const foo = {
                a: 1,
                b: 2
            },
            bar = 1;
      `,
      options: [4, { VariableDeclarator: { const: 3 } }],
    },
    {
      code: `
const foo : Foo = {
                a: 1,
                b: 2
            },
            bar = 1;
      `,
      options: [4, { VariableDeclarator: { const: 3 } }],
    },
    {
      code: `
const name: string = '  Typescript  '
        .toUpperCase()
        .trim(),

      greeting: string = (" Hello " + name)
        .toUpperCase()
        .trim();
      `,
      options: [2, { VariableDeclarator: { const: 3 } }],
    },
    {
      code: `
const div: JQuery<HTMLElement> = $('<div>')
        .addClass('some-class')
        .appendTo($('body')),

      button: JQuery<HTMLElement> = $('<button>')
        .text('Cancel')
        .appendTo(div);
      `,
      options: [2, { VariableDeclarator: { const: 3 } }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/441
    'const;',

    // https://github.com/typescript-eslint/typescript-eslint/issues/1115
    {
      code: 'const foo = function<> (): void {}',
    },
  ],
  invalid: [
    ...individualNodeTests.invalid,
    {
      code: `
type Foo = {
bar : string,
age : number,
}
      `,
      output: `
type Foo = {
    bar : string,
    age : number,
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
      ],
    },
    {
      code: `
interface Foo {
bar : string,
age : number,
foo(): boolean,
baz(
asdf: string,
): boolean,
new(): Foo,
new(
asdf: string,
): Foo,
}
      `,
      output: `
interface Foo {
    bar : string,
    age : number,
    foo(): boolean,
    baz(
        asdf: string,
    ): boolean,
    new(): Foo,
    new(
        asdf: string,
    ): Foo,
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 6,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 7,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 8,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 9,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 10,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 11,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 12,
          column: 1,
        },
      ],
    },
    {
      code: `
interface Foo {
bar : {
baz : string,
},
age : number,
}
      `,
      output: `
interface Foo {
    bar : {
        baz : string,
    },
    age : number,
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 6,
          column: 1,
        },
      ],
    },
    {
      code: `
interface Foo extends Bar {
bar : string,
age : number,
}
      `,
      output: `
interface Foo extends Bar {
    bar : string,
    age : number,
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
      ],
    },
    // this is just to show how eslint handles class with extends on a new line so we can keep the interface indent
    // handling the same
    {
      code: `
class Foo
extends Bar {
bar : string = "asdf";
age : number = 1;
}
      `,
      output: `
class Foo
    extends Bar {
    bar : string = "asdf";
    age : number = 1;
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      code: `
interface Foo
extends Bar {
bar : string,
age : number,
}
      `,
      output: `
interface Foo
    extends Bar {
    bar : string,
    age : number,
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      code: `
const foo : Foo<{
bar : string,
age : number,
}>
      `,
      output: `
const foo : Foo<{
    bar : string,
    age : number,
}>
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
      ],
    },
    {
      code: `
type T = {
bar : string,
age : number,
} | {
bar : string,
age : number,
}
      `,
      output: `
type T = {
    bar : string,
    age : number,
} | {
    bar : string,
    age : number,
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 6,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 7,
          column: 1,
        },
      ],
    },
    {
      code: `
type T =
    | {
bar : string,
age : number,
}
    | {
    bar : string,
    age : number,
}
      `,
      output: `
type T =
    | {
        bar : string,
        age : number,
    }
    | {
        bar : string,
        age : number,
    }
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 6,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 4,
          },
          line: 8,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 4,
          },
          line: 9,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 10,
          column: 1,
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
    import Dialogs = require("widgets/Dialogs");
      `,
      output: `
import Dialogs = require("widgets/Dialogs");
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '0 spaces',
            actual: 4,
          },
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
class Foo {
public bar : string;
private bar : string;
protected bar : string;
abstract bar : string;
foo : string;
constructor() {
const foo = "";
}
constructor(
asdf : number,
private test : boolean,
) {}
}
      `,
      output: `
class Foo {
    public bar : string;
    private bar : string;
    protected bar : string;
    abstract bar : string;
    foo : string;
    constructor() {
        const foo = "";
    }
    constructor(
        asdf : number,
        private test : boolean,
    ) {}
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 6,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 7,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 8,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 9,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 10,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 11,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 12,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 13,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 14,
          column: 1,
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
    abstract class Foo {}
    class Foo {}
      `,
      output: `
abstract class Foo {}
class Foo {}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '0 spaces',
            actual: 4,
          },
          line: 2,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '0 spaces',
            actual: 4,
          },
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
enum Foo {
bar,
baz = 1,
buzz = '',
}
      `,
      output: `
enum Foo {
    bar,
    baz = 1,
    buzz = '',
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      code: `
const enum Foo {
bar,
baz = 1,
buzz = '',
}
      `,
      output: `
const enum Foo {
    bar,
    baz = 1,
    buzz = '',
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
    export = Foo;
      `,
      output: `
export = Foo;
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '0 spaces',
            actual: 4,
          },
          line: 2,
          column: 1,
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
    declare function h(x: number): number;
      `,
      output: `
declare function h(x: number): number;
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '0 spaces',
            actual: 4,
          },
          line: 2,
          column: 1,
        },
      ],
    },
    {
      code: `
declare function h(
x: number,
): number;
      `,
      output: `
declare function h(
    x: number,
): number;
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
      ],
    },
    {
      code: `
namespace Validation {
export interface StringValidator {
isAcceptable(s: string): boolean;
}
}
      `,
      output: `
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      code: `
declare module "Validation" {
export interface StringValidator {
isAcceptable(s: string): boolean;
}
}
      `,
      output: `
declare module "Validation" {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 3,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '8 spaces',
            actual: 0,
          },
          line: 4,
          column: 1,
        },
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '4 spaces',
            actual: 0,
          },
          line: 5,
          column: 1,
        },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/internal/plugin-test-formatting
      code: `
    @Decorator()
class Foo {}
      `,
      output: `
@Decorator()
class Foo {}
      `,
      errors: [
        {
          messageId: 'wrongIndentation',
          data: {
            expected: '0 spaces',
            actual: 4,
          },
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
