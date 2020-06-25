import { TSESLint } from '@typescript-eslint/experimental-utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
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
    const linter = new TSESLint.Linter();
    const code = `
export const Price: React.SFC<PriceProps> = function Price(props) {}
`;
    const config: TSESLint.Linter.Config = {
      parser: '@typescript-eslint/parser',
      rules: {
        test: 'error',
      },
    };

    linter.defineParser('@typescript-eslint/parser', parser);
    linter.defineRule('test', function create(context) {
      return {
        TSTypeReference(node): void {
          const name = context.getSourceCode().getText(node.typeName);
          context.report({
            node,
            message: 'called on {{name}}',
            data: { name },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        },
      };
    });

    const messages = linter.verify(code, config, { filename: 'issue.ts' });

    expect(messages).toStrictEqual([
      {
        column: 21,
        endColumn: 42,
        endLine: 2,
        line: 2,
        message: 'called on React.SFC',
        nodeType: AST_NODE_TYPES.TSTypeReference,
        ruleId: 'test',
        severity: 2,
      },
      {
        column: 31,
        endColumn: 41,
        endLine: 2,
        line: 2,
        message: 'called on PriceProps',
        nodeType: AST_NODE_TYPES.TSTypeReference,
        ruleId: 'test',
        severity: 2,
      },
    ]);
  });
});
