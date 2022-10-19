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
  override x() {
    super.x();
    this.y();
  }
}
      `,
      options: [
        // raise for ordering
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
    super.x();
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
      errors: [{ messageId: 'missingSuperMethodCall' }],
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
  ],
});

// TODO needs test cases for Literal method name instead of Just Identifier
