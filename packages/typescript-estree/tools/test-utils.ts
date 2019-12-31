import * as parser from '../src/parser';
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
    return omitDeep(ast);
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
 * Removes the given keys from the given AST object recursively
 * @param root A JavaScript object to remove keys from
 * @param keysToOmit Names and predicate functions use to determine what keys to omit from the final object
 * @param nodes advance ast modifications
 * @returns formatted object
 */
export function omitDeep<T = Record<string, unknown>>(
  root: T,
  keysToOmit: { key: string; predicate: (value: unknown) => boolean }[] = [],
  nodes: Record<string, (node: T, parent: T | null) => void> = {},
): T {
  function isObjectLike(value: unknown | null): value is T {
    return (
      typeof value === 'object' && !(value instanceof RegExp) && value !== null
    );
  }

  function shouldOmit(keyName: string, val: unknown): boolean {
    if (keysToOmit?.length) {
      return keysToOmit.some(
        keyConfig => keyConfig.key === keyName && keyConfig.predicate(val),
      );
    }
    return false;
  }

  function visit(oNode: T, parent: T | null): T {
    if (!Array.isArray(oNode) && !isObjectLike(oNode)) {
      return oNode;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node: any = Array.isArray(oNode) ? [...oNode] : { ...oNode };

    for (const prop in node) {
      if (Object.prototype.hasOwnProperty.call(node, prop)) {
        if (shouldOmit(prop, node[prop]) || typeof node[prop] === 'undefined') {
          delete node[prop];
          continue;
        }

        const child = node[prop];

        if (Array.isArray(child)) {
          node[prop] = [];
          for (const el of child) {
            node[prop].push(visit(el, node));
          }
        } else if (isObjectLike(child)) {
          node[prop] = visit(child, node);
        }
      }
    }

    if (typeof node.type === 'string' && node.type in nodes) {
      nodes[node.type](node, parent);
    }

    return node;
  }

  return visit(root, null);
}
