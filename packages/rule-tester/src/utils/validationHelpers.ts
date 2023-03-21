import { simpleTraverse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/utils';
import type { Linter, SourceCode } from '@typescript-eslint/utils/ts-eslint';

/*
 * List every parameters possible on a test case that are not related to eslint
 * configuration
 */
export const RuleTesterParameters = [
  'name',
  'code',
  'filename',
  'options',
  'errors',
  'output',
  'only',
] as const;

/*
 * All allowed property names in error objects.
 */
export const ERROR_OBJECT_PARAMETERS: ReadonlySet<string> = new Set([
  'message',
  'messageId',
  'data',
  'type',
  'line',
  'column',
  'endLine',
  'endColumn',
  'suggestions',
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
  'desc',
  'messageId',
  'data',
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
  return text.replace(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u0009\u000b-\u001a]/gu,
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
export function wrapParser(parser: Linter.ParserModule): Linter.ParserModule {
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
        start: {
          get() {
            throw new Error(
              `Use ${objName}.range[0] instead of ${objName}.start`,
            );
          },
          configurable: true,
          enumerable: false,
        },
        end: {
          get() {
            throw new Error(
              `Use ${objName}.range[1] instead of ${objName}.end`,
            );
          },
          configurable: true,
          enumerable: false,
        },
      });
    }

    simpleTraverse(ast, {
      visitorKeys,
      enter: node => defineStartEndAsError('node', node),
    });
    ast.tokens?.forEach(token => defineStartEndAsError('token', token));
    ast.comments?.forEach(comment => defineStartEndAsError('token', comment));
  }

  if ('parseForESLint' in parser) {
    return {
      // @ts-expect-error -- see above
      [parserSymbol]: parser,
      parseForESLint(...args): Linter.ESLintParseResult {
        const ret = parser.parseForESLint(...args);

        defineStartEndAsErrorInTree(ret.ast, ret.visitorKeys);
        return ret;
      },
    };
  }

  return {
    // @ts-expect-error -- see above
    [parserSymbol]: parser,
    parse(...args): TSESTree.Program {
      const ast = parser.parse(...args);

      defineStartEndAsErrorInTree(ast);
      return ast;
    },
  };
}

/**
 * Function to replace `SourceCode.prototype.getComments`.
 */
export function getCommentsDeprecation(): never {
  throw new Error(
    '`SourceCode#getComments()` is deprecated and will be removed in a future major version. Use `getCommentsBefore()`, `getCommentsAfter()`, and `getCommentsInside()` instead.',
  );
}

const EMIT_LEGACY_RULE_API_WARNING: Record<string, boolean> = {};
/**
 * Emit a deprecation warning if function-style format is being used.
 */
export function emitLegacyRuleAPIWarning(ruleName: string): void {
  if (!EMIT_LEGACY_RULE_API_WARNING[`warned-${ruleName}`]) {
    EMIT_LEGACY_RULE_API_WARNING[`warned-${ruleName}`] = true;
    process.emitWarning(
      `"${ruleName}" rule is using the deprecated function-style format and will stop working in ESLint v9. Please use object-style format: https://eslint.org/docs/latest/extend/custom-rules`,
      'DeprecationWarning',
    );
  }
}

const EMIT_MISSING_SCHEMA_WARNING: Record<string, boolean> = {};
/**
 * Emit a deprecation warning if rule has options but is missing the "meta.schema" property
 */
export function emitMissingSchemaWarning(ruleName: string): void {
  if (!EMIT_MISSING_SCHEMA_WARNING[`warned-${ruleName}`]) {
    EMIT_MISSING_SCHEMA_WARNING[`warned-${ruleName}`] = true;
    process.emitWarning(
      `"${ruleName}" rule has options but is missing the "meta.schema" property and will stop working in ESLint v9. Please add a schema: https://eslint.org/docs/latest/extend/custom-rules#options-schemas`,
      'DeprecationWarning',
    );
  }
}

export const REQUIRED_SCENARIOS = ['valid', 'invalid'] as const;
