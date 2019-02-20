/**
 * @fileoverview Tools for running test cases
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import * as parser from '../src/parser';
import { ParserOptions } from '../src/parser-options';

/**
 * Returns a raw copy of the given AST
 * @param  {Object} ast the AST object
 * @returns {Object}     copy of the AST object
 */
export function getRaw(ast: any) {
  return JSON.parse(
    JSON.stringify(ast, (key, value) => {
      if ((key === 'start' || key === 'end') && typeof value === 'number') {
        return undefined;
      }
      return value;
    }),
  );
}

export function parseCodeAndGenerateServices(
  code: string,
  config: ParserOptions,
) {
  return parser.parseAndGenerateServices(code, config);
}

/**
 * Returns a function which can be used as the callback of a Jest test() block,
 * and which performs an assertion on the snapshot for the given code and config.
 * @param {string} code The source code to parse
 * @param {ParserOptions} config the parser configuration
 * @param {boolean} generateServices Flag determining whether to generate ast maps and program or not
 * @returns {jest.ProvidesCallback} callback for Jest it() block
 */
export function createSnapshotTestBlock(
  code: string,
  config: ParserOptions,
  generateServices?: true,
) {
  /**
   * @returns {Object} the AST object
   */
  function parse() {
    const ast = generateServices
      ? parser.parseAndGenerateServices(code, config).ast
      : parser.parse(code, config);
    return getRaw(ast);
  }

  return () => {
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

export function formatSnapshotName(
  filename: string,
  fixturesDir: string,
  fileExtension = '.js',
): string {
  return `fixtures/${filename
    .replace(fixturesDir + '/', '')
    .replace(fileExtension, '')}`;
}

/**
 * Check if file extension is one used for jsx
 * @param fileType
 */
export function isJSXFileType(fileType: string): boolean {
  if (fileType.startsWith('.')) {
    fileType = fileType.slice(1);
  }
  return fileType === 'js' || fileType === 'jsx' || fileType === 'tsx';
}
