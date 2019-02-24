import { Linter } from 'eslint';
import fs from 'fs';
import glob from 'glob';
import * as parser from '../../src/parser';
import {
  createScopeSnapshotTestBlock,
  formatSnapshotName,
} from '../tools/test-utils';

const FIXTURES_DIR = './tests/fixtures/basics';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('basics', () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    it(
      formatSnapshotName(filename, FIXTURES_DIR),
      createScopeSnapshotTestBlock(code),
    );
  });

  it('https://github.com/eslint/typescript-eslint-parser/issues/476', () => {
    const linter = new Linter();
    const code = `
export const Price: React.SFC<PriceProps> = function Price(props) {}
`;
    const config: Linter.Config = {
      parser: '@typescript-eslint/parser',
      rules: {
        test: 'error',
      },
    };

    linter.defineParser('@typescript-eslint/parser', parser);
    linter.defineRule('test', {
      create(context: any) {
        return {
          TSTypeReference(node: any) {
            const name = context.getSourceCode().getText(node.typeName);
            context.report({
              node,
              message: 'called on {{name}}',
              data: { name },
            });
          },
        };
      },
    });

    const messages = linter.verify(code, config, { filename: 'issue.ts' });

    expect(messages).toStrictEqual([
      {
        column: 21,
        endColumn: 42,
        endLine: 2,
        line: 2,
        message: 'called on React.SFC',
        nodeType: 'TSTypeReference',
        ruleId: 'test',
        severity: 2,
      },
      {
        column: 31,
        endColumn: 41,
        endLine: 2,
        line: 2,
        message: 'called on PriceProps',
        nodeType: 'TSTypeReference',
        ruleId: 'test',
        severity: 2,
      },
    ]);
  });
});
