import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-useless-template-literals';
import { getFixturesRootDir } from '../RuleTester';
import { getNoUselessTemplateExpressionTestCases } from './no-useless-template-expression.test';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run(
  'no-useless-template-literals',
  rule,
  getNoUselessTemplateExpressionTestCases(),
);
