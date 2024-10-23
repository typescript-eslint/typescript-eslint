import { RuleTester } from '@typescript-eslint/rule-tester';
import path from 'node:path';

import rule, {
  PACKAGES_DIR,
} from '../../src/rules/no-relative-paths-to-internal-packages';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: PACKAGES_DIR,
    },
  },
});

ruleTester.run('no-relative-paths-to-internal-packages', rule, {
  invalid: [
    {
      code: "import { parse } from '../../../typescript-estree';",
      errors: [
        {
          line: 1,
          messageId: 'noRelativePathsToInternalPackages',
        },
      ],
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/my-awesome-rule.ts',
      ),
      output: `import { parse } from '@typescript-eslint/typescript-estree';`,
    },
    {
      code: "import { parse } from '../../../typescript-estree/inner-module';",
      errors: [
        {
          line: 1,
          messageId: 'noRelativePathsToInternalPackages',
        },
      ],
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/my-awesome-rule.ts',
      ),
      output: `import { parse } from '@typescript-eslint/typescript-estree/inner-module';`,
    },
    {
      code: "import type { ValueOf } from '../../../../utils';",
      errors: [
        {
          line: 1,
          messageId: 'noRelativePathsToInternalPackages',
        },
      ],
      filename: path.resolve(
        PACKAGES_DIR,
        'ast-spec/src/expression/AssignmentExpression/spec.ts',
      ),
      output: "import type { ValueOf } from '@typescript-eslint/utils';",
    },
    {
      code: `
import type {
  MemberExpressionComputedName,
  MemberExpressionNonComputedName,
} from '../../../types/src/generated/ast-spec';
      `,
      errors: [
        {
          line: 5,
          messageId: 'noRelativePathsToInternalPackages',
        },
      ],
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/prefer-find.ts',
      ),
      output: `
import type {
  MemberExpressionComputedName,
  MemberExpressionNonComputedName,
} from '@typescript-eslint/types/src/generated/ast-spec';
      `,
    },
  ],
  valid: [
    "import { parse } from '@typescript-eslint/typescript-estree';",
    "import { something } from 'not/a/relative/path';",
    {
      code: "import { something } from './utils';",
      filename: path.resolve(
        PACKAGES_DIR,
        'eslint-plugin/src/rules/my-awesome-rule.ts',
      ),
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
});
