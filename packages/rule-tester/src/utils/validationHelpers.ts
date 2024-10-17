import type { TSESTree } from '@typescript-eslint/utils';
import type { Parser, SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { simpleTraverse } from '@typescript-eslint/typescript-estree';

/*
 * List every parameters possible on a test case that are not related to eslint
 * configuration
 */
export const RULE_TESTER_PARAMETERS = [
  'after',
  'before',
  'code',
  'defaultFilenames',
  'dependencyConstraints',
  'errors',
  'filename',
  'name',
  'only',
  'options',
  'output',
  'skip',
] as const;

/*
 * All allowed property names in error objects.
 */
export const ERROR_OBJECT_PARAMETERS: ReadonlySet<string> = new Set([
  'column',
  'data',
  'endColumn',
  'endLine',
  'line',
  'message',
  'messageId',
  'suggestions',
  'type',
]);
export const FRIENDLY_ERROR_OBJECT_PARAMETER_LIST = `[${[
  ...ERROR_OBJECT_PARAMETERS,
]
  .map(key => `'${key}'`)
  .join(', ')}]`;

/*
 * All allowed property names in suggestion objects.
 */
export const SUGGESTION_OBJECT_PARAMETERS: ReadonlySet<string> = new Set([
  'data',
  'desc',
  'messageId',
  'output',
]);
export const FRIENDLY_SUGGESTION_OBJECT_PARAMETER_LIST = `[${[
  ...SUGGESTION_OBJECT_PARAMETERS,
]
  .map(key => `'${key}'`)
  .join(', ')}]`;

/**
 * Replace control characters by `\u00xx` form.
 */
export function sanitize(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  return text.replaceAll(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u0009\u000b-\u001a]/gu,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    c => `\\u${c.codePointAt(0)!.toString(16).padStart(4, '0')}`,
  );
}

// this symbol is used internally by ESLint to unwrap the wrapped parser
// https://github.com/eslint/eslint/blob/129e252132c7c476d7de17f40b54a333ddb2e6bb/lib/linter/linter.js#L139-L146
const parserSymbol = Symbol.for('eslint.RuleTester.parser');
/**
 * Wraps the given parser in order to intercept and modify return values from the `parse` and `parseForESLint` methods, for test purposes.
 * In particular, to modify ast nodes, tokens and comments to throw on access to their `start` and `end` properties.
 */
export function wrapParser(
  parser: Parser.LooseParserModule,
): Parser.LooseParserModule {
  /**
   * Define `start`/`end` properties of all nodes of the given AST as throwing error.
   */
  function defineStartEndAsErrorInTree(
    ast: TSESTree.Program,
    visitorKeys?: Readonly<SourceCode.VisitorKeys>,
  ): void {
    /**
     * Define `start`/`end` properties as throwing error.
     */
    function defineStartEndAsError(objName: string, node: unknown): void {
      Object.defineProperties(node, {
        end: {
          configurable: true,
          enumerable: false,
          get() {
            throw new Error(
              `Use ${objName}.range[1] instead of ${objName}.end`,
            );
          },
        },
        start: {
          configurable: true,
          enumerable: false,
          get() {
            throw new Error(
              `Use ${objName}.range[0] instead of ${objName}.start`,
            );
          },
        },
      });
    }

    simpleTraverse(ast, {
      enter: node => defineStartEndAsError('node', node),
      visitorKeys,
    });
    ast.tokens?.forEach(token => defineStartEndAsError('token', token));
    ast.comments?.forEach(comment => defineStartEndAsError('token', comment));
  }

  if ('parseForESLint' in parser) {
    return {
      parseForESLint(...args): Parser.ParseResult {
        const parsed = parser.parseForESLint(...args) as Parser.ParseResult;

        defineStartEndAsErrorInTree(parsed.ast, parsed.visitorKeys);
        return parsed;
      },

      // @ts-expect-error -- see above
      [parserSymbol]: parser,
    };
  }

  return {
    parse(...args): TSESTree.Program {
      const ast = parser.parse(...args) as TSESTree.Program;

      defineStartEndAsErrorInTree(ast);
      return ast;
    },

    // @ts-expect-error -- see above
    [parserSymbol]: parser,
  };
}

export const REQUIRED_SCENARIOS = ['valid', 'invalid'] as const;
