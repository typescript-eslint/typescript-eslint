import { RuleTester } from '../RuleTester';
import rule from '../../src/rules/call-super-on-override';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('call-super-on-override', rule, {
  valid: [
    {
      code: `
class ValidSample {
  override x() {
    this.y();
    super.x();
  }
}
      `,
    },
    {
      code: `
class ValidSample {
  override ['x-y']() {
    super['x-y']();
  }
  override ['z']() {
    super.z();
  }
  override h() {
    super['h']()
  }
  override [M]() {
    super[M]();
  }
}
      `,
    },
    {
      code: `
class ValidSample {
  override x() {
    super.x();
    this.y();
  }
}
      `,
      options: [
        // ordering
        {
          topLevel: true,
        },
      ],
    },
    {
      code: `
class ValidSample {
  override x() {
    p();
    l();
    super['x']();
    this.y();
  }
}
      `,
      options: [
        // not raise for ordering
        {
          topLevel: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
class InvalidSample {
  override x() {
    this.x();
    super.x = () => void 0;
    super.x;
  }
}
      `,
      errors: [
        {
          messageId: 'missingSuperMethodCall',
          data: { property: '.x', parameterTuple: '()' },
        },
      ],
    },
    {
      code: `
class InvalidSample {
  override ['x-y-z']() {
    this['x-y-z']();
    super['x-y-z'] = () => void 0;
    super['x-y-z'];
  }
}
      `,
      errors: [
        {
          messageId: 'missingSuperMethodCall',
          data: { property: "['x-y-z']", parameterTuple: '()' },
        },
      ],
    },
    {
      code: `
class InvalidSample {
  override x() {
    super.x = () => void 0;
    this.x();
    super.x();
  }
}
      `,
      options: [
        // raise only for top level super call absence
        {
          topLevel: true,
        },
      ],
      errors: [{ messageId: 'topLevelSuperMethodCall' }],
    },
    {
      code: `
class InvalidSample {
  override x(y: number, z: string) {}
}
      `,
      errors: [
        {
          messageId: 'missingSuperMethodCall',
          data: { property: '.x', parameterTuple: '(y, z)' },
        },
      ],
    },
    {
      code: `
class ValidSample {
  override x() {
    this.x.y.z.c.v.b.n.l();
    super.x();
  }
}
      `,
      options: [
        // raise only for top level super call absence (deep case)
        {
          topLevel: true,
        },
      ],
      errors: [{ messageId: 'topLevelSuperMethodCall' }],
    },
    {
      code: `
class InvalidSample {
  override [M]() {
    super.M()
  }
}
      `,
      errors: [
        {
          messageId: 'missingSuperMethodCall',
          data: { property: '[M]', parameterTuple: '()' },
        },
      ],
    },
    {
      code: `
class InvalidSample {
  override [null]() {}
  override ['null']() {}
}
      `,
      errors: [
        {
          messageId: 'missingSuperMethodCall',
          data: { property: '[null]', parameterTuple: '()' },
        },
        {
          messageId: 'missingSuperMethodCall',
          data: { property: "['null']", parameterTuple: '()' },
        },
      ],
    },
  ],
});

// TODO needs test cases for Literal method name instead of Just Identifier
