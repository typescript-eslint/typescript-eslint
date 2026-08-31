import { ESLint } from 'eslint';

const eslint = new ESLint();
const [result] = await eslint.lintFiles(['src/index.ts']);

process.stderr.write(
  JSON.stringify(
    result.messages.map(({ column, endColumn, endLine, line, ruleId }) => ({
      column,
      endColumn,
      endLine,
      line,
      ruleId,
    })),
  ),
);
