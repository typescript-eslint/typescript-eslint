import * as parser from '@typescript-eslint/parser';
import { ESLintUtils } from '@typescript-eslint/utils';
import { Linter } from 'eslint';

import { getFixturesRootDir } from './RuleTester';

const captured: unknown[] = [];

const probe = ESLintUtils.RuleCreator.withoutDocs({
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();
    return {
      CallExpression(node): void {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);
        const symbol = services.getSymbolAtLocation(node.callee);
        const signature = checker.getResolvedSignature(tsNode);
        const safe = (fn: () => unknown) => {
          try {
            return fn();
          } catch (error) {
            return `THREW: ${(error as Error).message}`;
          }
        };
        captured.push({
          signatureTags: safe(() => signature?.getJsDocTags().map(t => t.name)),
          symbolName: symbol?.name,
          symbolTags: safe(() =>
            symbol?.getJsDocTags(checker).map(t => t.name),
          ),
          symbolTagText: safe(() =>
            JSON.stringify(symbol?.getJsDocTags(checker)),
          ),
        });
      },
    };
  },
  defaultOptions: [],
  meta: { messages: {}, schema: [], type: 'problem' },
});

function run(native: boolean) {
  captured.length = 0;
  new Linter().verify(
    '/** @deprecated Use bar. */ declare function foo(): void;\nfoo();',
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: parser as never,
        parserOptions: {
          ...(native
            ? { projectService: { backend: 'native' } }
            : { projectService: true }),
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
      plugins: { p: { rules: { probe: probe as never } } },
      rules: { 'p/probe': 'error' },
    } as never,
    `${getFixturesRootDir()}/file.ts`,
  );
  return [...captured];
}

it('compares', () => {
  expect({ classic: run(false), native: run(true) }).toBe('SHOW');
});
