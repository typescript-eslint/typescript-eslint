import * as parser from '../src/parser';
import { TSESTreeOptions } from '../src/parser-options';

import 'jest-specific-snapshot';

/**
 * Returns a raw copy of the given AST
 * @param ast the AST object
 * @returns copy of the AST object
 */
export function getRaw(ast: parser.TSESTree.Program): parser.TSESTree.Program {
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
  config: TSESTreeOptions,
): parser.ParseAndGenerateServicesResult<parser.TSESTreeOptions> {
  return parser.parseAndGenerateServices(code, config);
}

/**
 * Returns a function which can be used as the callback of a Jest test() block,
 * and which performs an assertion on the snapshot for the given code and config.
 * @param code The source code to parse
 * @param config the parser configuration
 * @param generateServices Flag determining whether to generate ast maps and program or not
 * @param snapshotPath path to output snapshot file
 * @returns callback for Jest it() block
 */
export function createSnapshotTestBlock(
  code: string,
  config: TSESTreeOptions,
  generateServices?: true,
  snapshotPath?: string,
): jest.ProvidesCallback {
  /**
   * @returns {Object} the AST object
   */
  function parse(): parser.TSESTree.Program {
    const ast = generateServices
      ? parser.parseAndGenerateServices(code, config).ast
      : parser.parse(code, config);
    return getRaw(ast);
  }

  return (): void => {
    try {
      const result = parse();
      if (snapshotPath) {
        expect(result).toMatchSpecificSnapshot(
          `./__snapshots__/${snapshotPath}.snap`,
        );
      } else {
        expect(result).toMatchSnapshot();
      }
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
