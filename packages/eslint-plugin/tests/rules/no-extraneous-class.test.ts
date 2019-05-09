import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-extraneous-class';
import { RuleTester } from '../RuleTester';

const empty = {
  messageId: 'empty' as 'empty',
};
const onlyStatic = {
  messageId: 'onlyStatic' as 'onlyStatic',
};
const onlyConstructor = {
  messageId: 'onlyConstructor' as 'onlyConstructor',
};

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-extraneous-class', rule, {
  valid: [
    `
class Foo {
    public prop = 1;
    constructor() {}
}
`,
    `
export class CClass extends BaseClass {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
    constructor() {}
}
`,
    `
class Foo {
   constructor(
     public bar: string
   ) {}
}
`,
    {
      code: 'class Foo {}',
      options: [{ allowEmpty: true }],
    },
    {
      code: `
class Foo {
    constructor() {}
}
`,
      options: [{ allowConstructorOnly: true }],
    },
    {
      code: `
export class Bar {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
}
`,
      options: [{ allowStaticOnly: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/170
    'export default class { hello() { return "I am foo!"; } }',
  ],

  invalid: [
    {
      code: 'class Foo {}',
      errors: [empty],
    },
    {
      code: `
class Foo {
    public prop = 1;
    constructor() {
        class Bar {
            static PROP = 2;
        }
    }
}
export class Bar {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
}
`,
      errors: [onlyStatic, onlyStatic],
    },
    {
      code: `
class Foo {
    constructor() {}
}
`,
      errors: [onlyConstructor],
    },
    {
      code: `
export class AClass {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
    constructor() {
        class nestedClass {
        }
    }
}

`,
      errors: [onlyStatic, empty],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/170
      code: 'export default class { static hello() {} }',
      errors: [
        {
          ...onlyStatic,
          type: AST_NODE_TYPES.ClassDeclaration,
        },
      ],
    },
  ],
});
