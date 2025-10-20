import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/strict-interface-implementation';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('strict-interface-implementation', rule, {
  valid: [
    'class Standalone {}',
    'const Standalone = class {};',
    'const Standalone = class Standalone {};',
    `
interface Base {}
class Derived implements Base {}
    `,
    `
interface Base {
  process(): void;
}
class Derived implements Base {
  process() {}
}
    `,
    `
interface Base {
  value: string;
}
class Derived implements Base {
  value: string;
}
    `,
  ],
  invalid: [
    {
      code: `
interface Base {
  value: string | undefined;
}

class Derived implements Base {
  value: string;
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'value',
            target: 'property',
          },
          messageId: 'unassignable',
        },
      ],
    },
    {
      code: `
interface Base {
  process(value: string | null): void;
}

class Derived implements Base {
  public process(value: string) {}
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'process',
            target: 'method',
          },
          messageId: 'unassignable',
        },
      ],
    },
    {
      code: `
interface Base {
  process(value?: string): void;
}

class Derived implements Base {
  public process(value: string) {}
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'process',
            target: 'method',
          },
          messageId: 'unassignable',
        },
      ],
    },
  ],
});
