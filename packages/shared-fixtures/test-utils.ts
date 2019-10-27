/**
 * Returns a raw copy of the given AST
 * @param  {Object} ast the AST object
 * @returns {Object}     copy of the AST object
 */
export function getRaw<T>(ast: T): T {
  return JSON.parse(
    JSON.stringify(ast, (key, value) => {
      if ((key === 'start' || key === 'end') && typeof value === 'number') {
        return undefined;
      }
      return value;
    }),
  );
}

export function createSnapshotTestBlock<TOptions, TParseOnlyReturn>(
  code: string,
  config: TOptions,
  parseImpl: (code: string, config: TOptions) => TParseOnlyReturn,
): () => void;
export function createSnapshotTestBlock<
  TOptions,
  TParseAndGenerateReturn extends { ast: unknown }
>(
  code: string,
  config: TOptions,
  parseImpl: (code: string, config: TOptions) => TParseAndGenerateReturn,
  generateServices: true,
): () => void;
/**
 * Returns a function which can be used as the callback of a Jest test() block,
 * and which performs an assertion on the snapshot for the given code and config.
 * @param {string} code The source code to parse
 * @param {TSESTreeOptions} config the parser configuration
 * @param {boolean} generateServices Flag determining whether to generate ast maps and program or not
 * @returns {jest.ProvidesCallback} callback for Jest it() block
 */
export function createSnapshotTestBlock<
  TOptions,
  TParseAndGenerateReturn extends { ast: unknown },
  TParseOnlyReturn
>(
  code: string,
  config: TOptions,
  parseImpl:
    | ((code: string, config: TOptions) => TParseOnlyReturn)
    | ((code: string, config: TOptions) => TParseAndGenerateReturn),
  generateServices?: true,
): () => void {
  /**
   * @returns {Object} the AST object
   */
  function parse(): unknown {
    const res = parseImpl(code, config);
    const ast =
      generateServices && 'ast' in res ? res.ast : parseImpl(code, config);
    return getRaw(ast);
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

export function formatSnapshotName(
  filename: string,
  fixturesDir: string,
  fileExtension = '.js',
): string {
  return `fixtures/${filename
    .replace(fixturesDir + '/', '')
    .replace(fileExtension, '')}`;
}
