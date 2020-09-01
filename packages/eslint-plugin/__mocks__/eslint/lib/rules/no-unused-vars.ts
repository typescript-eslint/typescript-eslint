import { loadEslintModule } from '../../../../tools/eslint-test-loader';

const rule = loadEslintModule('/lib/rules/no-unused-vars');
export default rule;
