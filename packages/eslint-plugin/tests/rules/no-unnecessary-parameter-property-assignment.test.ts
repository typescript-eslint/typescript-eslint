import rule, {
  messageId,
} from '../../src/rules/no-unnecessary-parameter-property-assignment';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unnecessary-parameter-property-assignment', rule, {
  valid: [
    `
class Foo {
  constructor(name: string) {}
}
    `,
    `
class Foo {
  constructor(private name: string) {}
}
    `,
    `
class Foo {
  constructor(private name: string) {
    this.name = someAssignment;
  }
}
    `,
    `
class Foo {
  constructor(private name: string) {
    this.name = this.someAssignment;
  }
}
    `,
    `
class Foo {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}
    `,
    `
class Foo {
  differentName: string;
  constructor(private name: string) {
    this.differentName = name;
  }
}
    `,
    `
class Foo {
  constructor(private name: string) {
    this['name'] = name;
  }
}
    `,
    `
class Foo {
  names: unknown[];

  constructor(...names: unknown[]) {
    this.names = names;
  }
}
    `,
  ],
  invalid: [
    {
      code: `
class Foo {
  constructor(private name: string) {
    this.name = name;
  }
}
      `,
      errors: [
        {
          messageId,
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(protected name: string) {
    this.name = name;
  }
}
      `,
      errors: [
        {
          messageId,
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
  constructor(public name: string) {
    this.name = name;
  }
}
      `,
      errors: [
        {
          messageId,
          line: 4,
          column: 5,
        },
      ],
    },
  ],
});
