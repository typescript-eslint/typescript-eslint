import * as parser from '../../src/parser';
import { ParserOptions } from '../../src/parser-options';
import { getScopeTree } from './scope-analysis';

export const defaultConfig = {
  loc: true,
  range: true,
  raw: true,
  tokens: true,
  comment: true,
  errorOnUnknownASTType: true,
  sourceType: 'module',
};

/**
 * Returns a function which can be used as the callback of a Jest test() block,
 * and which performs an assertion on the snapshot for the given code and config.
 * @param code The source code to parse
 * @param config the parser configuration
 * @returns callback for Jest test() block
 */
export function createScopeSnapshotTestBlock(
  code: string,
  config: ParserOptions = {},
): () => void {
  config = Object.assign({}, defaultConfig, config);

  /**
   * @returns {Object} the AST object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function parse(): any {
    const result = parser.parseForESLint(code, config);
    return getScopeTree(result.scopeManager);
  }

  return (): void => {
    try {
      const result = parse();
      expect(result).toMatchSnapshot();
    } catch (e) {
      /**
       * If we are deliberately throwing because of encountering an unknown
       * AST_NODE_TYPE, we rethrow to cause the test to fail
       */
      if (e.message.match('Unknown AST_NODE_TYPE')) {
        throw new Error(e);
      }
      expect(parse).toThrowErrorMatchingSnapshot();
    }
  };
}
