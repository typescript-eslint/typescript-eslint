import * as parser from '../src';
import { TSESTreeOptions } from '../src/parser-options';

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
 * @returns callback for Jest it() block
 */
export function createSnapshotTestBlock(
  code: string,
  config: TSESTreeOptions,
  generateServices?: true,
): jest.ProvidesCallback {
  /**
   * @returns the AST object
   */
  function parse(): parser.TSESTree.Program {
    const ast = generateServices
      ? parser.parseAndGenerateServices(code, config).ast
      : parser.parse(code, config);
    return deeplyCopy(ast);
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

/**
 * Returns a raw copy of the typescript AST
 * @param ast the AST object
 * @returns copy of the AST object
 */
export function deeplyCopy<T>(ast: T): T {
  return omitDeep(ast) as T;
}

type UnknownObject = Record<string, unknown>;

function isObjectLike(value: unknown | null): value is UnknownObject {
  return (
    typeof value === 'object' && !(value instanceof RegExp) && value !== null
  );
}

/**
 * Removes the given keys from the given AST object recursively
 * @param root A JavaScript object to remove keys from
 * @param keysToOmit Names and predicate functions use to determine what keys to omit from the final object
 * @param selectors advance ast modifications
 * @returns formatted object
 */
export function omitDeep<T = UnknownObject>(
  root: T,
  keysToOmit: { key: string; predicate: (value: unknown) => boolean }[] = [],
  selectors: Record<
    string,
    (node: UnknownObject, parent: UnknownObject | null) => void
  > = {},
): UnknownObject {
  function shouldOmit(keyName: string, val: unknown): boolean {
    if (keysToOmit?.length) {
      return keysToOmit.some(
        keyConfig => keyConfig.key === keyName && keyConfig.predicate(val),
      );
    }
    return false;
  }

  function visit(
    oNode: UnknownObject,
    parent: UnknownObject | null,
  ): UnknownObject {
    if (!Array.isArray(oNode) && !isObjectLike(oNode)) {
      return oNode;
    }

    const node = { ...oNode };

    for (const prop in node) {
      if (Object.prototype.hasOwnProperty.call(node, prop)) {
        if (shouldOmit(prop, node[prop]) || typeof node[prop] === 'undefined') {
          delete node[prop];
          continue;
        }

        const child = node[prop];
        if (Array.isArray(child)) {
          const value = [];
          for (const el of child) {
            value.push(visit(el, node));
          }
          node[prop] = value;
        } else if (isObjectLike(child)) {
          node[prop] = visit(child, node);
        }
      }
    }

    if (typeof node.type === 'string' && node.type in selectors) {
      selectors[node.type](node, parent);
    }

    return node;
  }

  return visit(root as UnknownObject, null);
}
