import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-import-type-side-effects';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-import-type-side-effects', rule, {
  valid: [
    "import T from 'mod';",
    "import * as T from 'mod';",
    "import { T } from 'mod';",
    "import type { T } from 'mod';",
    "import type { T, U } from 'mod';",
    "import { type T, U } from 'mod';",
    "import { T, type U } from 'mod';",
    "import type T from 'mod';",
    "import type T, { U } from 'mod';",
    "import T, { type U } from 'mod';",
    "import type * as T from 'mod';",
    "import 'mod';",
  ],
  invalid: [
    {
      code: "import { type A } from 'mod';",
      output: "import type { A } from 'mod';",
      errors: [{ messageId: 'useTopLevelQualifier' }],
    },
    {
      code: "import { type A as AA } from 'mod';",
      output: "import type { A as AA } from 'mod';",
      errors: [{ messageId: 'useTopLevelQualifier' }],
    },
    {
      code: "import { type A, type B } from 'mod';",
      output: "import type { A, B } from 'mod';",
      errors: [{ messageId: 'useTopLevelQualifier' }],
    },
    {
      code: "import { type A as AA, type B as BB } from 'mod';",
      output: "import type { A as AA, B as BB } from 'mod';",
      errors: [{ messageId: 'useTopLevelQualifier' }],
    },
  ],
});
