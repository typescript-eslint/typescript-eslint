import { RuleTester } from '@typescript-eslint/rule-tester';
import path from 'path';

import rule, {
  PACKAGES_DIR,
} from '../../src/rules/no-relative-paths-to-internal-packages';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-relative-paths-to-internal-packages', rule, {
  valid: [
    "import { parse } from '@typescript-eslint/typescript-estree';",
    "import { something } from 'not/a/relative/path';",
    {
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/my-awesome-rule.ts',
      ),
      code: "import { something } from './utils';",
    },
    {
      code: "import type { ValueOf } from './utils';",
      filename: path.resolve(
        PACKAGES_DIR,
        'ast-spec/src/expression/AssignmentExpression/spec.ts',
      ),
    },
    {
      code: "import type { ValueOf } from '../../utils';",
      filename: path.resolve(
        PACKAGES_DIR,
        'ast-spec/src/expression/AssignmentExpression/spec.ts',
      ),
    },
    {
      code: "import type { ValueOf } from '../../../utils';",
      filename: path.resolve(
        PACKAGES_DIR,
        'ast-spec/src/expression/AssignmentExpression/spec.ts',
      ),
    },
  ],
  invalid: [
    {
      code: "import { parse } from '../../../typescript-estree';",
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/my-awesome-rule.ts',
      ),
      output: `import { parse } from '@typescript-eslint/typescript-estree';`,
      errors: [
        {
          messageId: 'noRelativePathsToInternalPackages',
          line: 1,
        },
      ],
    },
    {
      code: "import { parse } from '../../../typescript-estree/inner-module';",
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/my-awesome-rule.ts',
      ),
      output: `import { parse } from '@typescript-eslint/typescript-estree/inner-module';`,
      errors: [
        {
          messageId: 'noRelativePathsToInternalPackages',
          line: 1,
        },
      ],
    },
    {
      code: "import type { ValueOf } from '../../../../utils';",
      output: "import type { ValueOf } from '@typescript-eslint/utils';",
      filename: path.resolve(
        PACKAGES_DIR,
        'ast-spec/src/expression/AssignmentExpression/spec.ts',
      ),
      errors: [
        {
          messageId: 'noRelativePathsToInternalPackages',
          line: 1,
        },
      ],
    },
    {
      code: `
import type {
  MemberExpressionComputedName,
  MemberExpressionNonComputedName,
} from '../../../types/src/generated/ast-spec';
      `,
      output: `
import type {
  MemberExpressionComputedName,
  MemberExpressionNonComputedName,
} from '@typescript-eslint/types/src/generated/ast-spec';
      `,
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/prefer-find.ts',
      ),
      errors: [
        {
          messageId: 'noRelativePathsToInternalPackages',
          line: 5,
        },
      ],
    },
  ],
});
