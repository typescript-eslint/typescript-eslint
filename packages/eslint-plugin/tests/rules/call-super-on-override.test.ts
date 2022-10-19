import rule from '../../src/rules/call-super-on-override';
import { RuleTester } from '../RuleTester';

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
    super['h']();
  }
  override [M]() {
    super[M]();
  }
}
      `,
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
class InvalidSample {
  override [M]() {
    super.M();
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
