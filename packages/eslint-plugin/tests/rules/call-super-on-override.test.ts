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
  override x() {}
}
      `,
      options: [
        // off
        {
          ignoreMethods: true,
          topLevel: false,
        },
      ],
    },
    {
      code: `
class ValidSample {
  override x() {
    this.y();
    super.x();
  }
}
      `,
      options: [
        // raise only for super absence
        {
          ignoreMethods: false,
          topLevel: false,
        },
      ],
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
          ignoreMethods: false,
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
          ignoreMethods: false,
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
      options: [
        // raise only for super call absence
        {
          ignoreMethods: false,
          topLevel: false,
        },
      ],
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
          ignoreMethods: false,
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
        // not raise for ordering
        {
          ignoreMethods: false,
          topLevel: true,
        },
      ],
      errors: [{ messageId: 'topLevelSuperMethodCall' }],
    },
  ],
});
