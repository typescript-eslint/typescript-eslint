/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import calculateProjectParserOptions from './tsconfig-parser';
import semver from 'semver';
import ts from 'typescript';
import convert from './ast-converter';
import {
  Extra,
  ParserOptions,
  ESTreeToken,
  ESTreeComment
} from './temp-types-based-on-js-source';
import { Program } from './estree/spec';
import util from './node-utils';

const packageJSON = require('../package.json');

const SUPPORTED_TYPESCRIPT_VERSIONS = packageJSON.devDependencies.typescript;
const ACTIVE_TYPESCRIPT_VERSION = ts.version;
const isRunningSupportedTypeScriptVersion = semver.satisfies(
  ACTIVE_TYPESCRIPT_VERSION,
  SUPPORTED_TYPESCRIPT_VERSIONS
);

let extra: Extra;
let warnedAboutTSVersion = false;

/**
 * Compute the filename based on the parser options
 *
 * @param options Parser options
 */
function getFileName({ jsx }: { jsx?: boolean }) {
  return jsx ? 'estree.tsx' : 'estree.ts';
}

/**
 * Resets the extra config object
 * @returns {void}
 */
function resetExtra(): void {
  extra = {
    tokens: null,
    range: false,
    loc: false,
    comment: false,
    comments: [],
    strict: false,
    jsx: false,
    useJSXTextNode: false,
    log: console.log,
    projects: [],
    errorOnUnknownASTType: false,
    code: '',
    tsconfigRootDir: process.cwd()
  };
}

/**
 * @param {string} code The code of the file being linted
 * @param {Object} options The config object
 * @returns {{ast: ts.SourceFile, program: ts.Program} | undefined} If found, returns the source file corresponding to the code and the containing program
 */
function getASTFromProject(code: string, options: ParserOptions) {
  return util.firstDefined(
    calculateProjectParserOptions(
      code,
      options.filePath || getFileName(options),
      extra
    ),
    (currentProgram: ts.Program) => {
      const ast = currentProgram.getSourceFile(
        options.filePath || getFileName(options)
      );
      return ast && { ast, program: currentProgram };
    }
  );
}

/**
 * @param {string} code The code of the file being linted
 * @returns {{ast: ts.SourceFile, program: ts.Program}} Returns a new source file and program corresponding to the linted code
 */
function createNewProgram(code: string) {
  // Even if jsx option is set in typescript compiler, filename still has to
  // contain .tsx file extension
  const FILENAME = getFileName(extra);

  const compilerHost = {
    fileExists() {
      return true;
    },
    getCanonicalFileName() {
      return FILENAME;
    },
    getCurrentDirectory() {
      return '';
    },
    getDirectories() {
      return [];
    },
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },

    // TODO: Support Windows CRLF
    getNewLine() {
      return '\n';
    },
    getSourceFile(filename: string) {
      return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
    },
    readFile() {
      return undefined;
    },
    useCaseSensitiveFileNames() {
      return true;
    },
    writeFile() {
      return null;
    }
  };

  const program = ts.createProgram(
    [FILENAME],
    {
      noResolve: true,
      target: ts.ScriptTarget.Latest,
      jsx: extra.jsx ? ts.JsxEmit.Preserve : undefined
    },
    compilerHost
  );

  const ast = program.getSourceFile(FILENAME)!;

  return { ast, program };
}

/**
 * @param {string} code The code of the file being linted
 * @param {Object} options The config object
 * @param {boolean} shouldProvideParserServices True iff the program should be attempted to be calculated from provided tsconfig files
 * @returns {{ast: ts.SourceFile, program: ts.Program}} Returns a source file and program corresponding to the linted code
 */
function getProgramAndAST(
  code: string,
  options: ParserOptions,
  shouldProvideParserServices: boolean
) {
  return (
    (shouldProvideParserServices && getASTFromProject(code, options)) ||
    createNewProgram(code)
  );
}

//------------------------------------------------------------------------------
// Parser
//------------------------------------------------------------------------------

type AST<T extends ParserOptions> = Program &
  (T['range'] extends true ? { range: [number, number] } : {}) &
  (T['tokens'] extends true ? { tokens: ESTreeToken[] } : {}) &
  (T['comment'] extends true ? { comments: ESTreeComment[] } : {});

/**
 * Parses the given source code to produce a valid AST
 * @param {string} code    TypeScript code
 * @param {boolean} shouldGenerateServices Flag determining whether to generate ast maps and program or not
 * @param {ParserOptions} options configuration object for the parser
 * @returns {Object}         the AST
 */
function generateAST<T extends ParserOptions = ParserOptions>(
  code: string,
  options: T = {} as T,
  shouldGenerateServices = false
): {
  estree: AST<T>;
  program: typeof shouldGenerateServices extends true
    ? ts.Program
    : (ts.Program | undefined);
  astMaps: typeof shouldGenerateServices extends true
    ? {
        esTreeNodeToTSNodeMap: WeakMap<object, any>;
        tsNodeToESTreeNodeMap: WeakMap<object, any>;
      }
    : {
        esTreeNodeToTSNodeMap?: WeakMap<object, any>;
        tsNodeToESTreeNodeMap?: WeakMap<object, any>;
      };
} {
  const toString = String;

  if (typeof code !== 'string' && !((code as any) instanceof String)) {
    code = toString(code);
  }

  resetExtra();

  if (typeof options !== 'undefined') {
    extra.range = typeof options.range === 'boolean' && options.range;
    extra.loc = typeof options.loc === 'boolean' && options.loc;

    if (typeof options.tokens === 'boolean' && options.tokens) {
      extra.tokens = [];
    }

    if (typeof options.comment === 'boolean' && options.comment) {
      extra.comment = true;
      extra.comments = [];
    }

    if (typeof options.jsx === 'boolean' && options.jsx) {
      extra.jsx = true;
    }

    /**
     * Allow the user to cause the parser to error if it encounters an unknown AST Node Type
     * (used in testing).
     */
    if (
      typeof options.errorOnUnknownASTType === 'boolean' &&
      options.errorOnUnknownASTType
    ) {
      extra.errorOnUnknownASTType = true;
    }

    if (typeof options.useJSXTextNode === 'boolean' && options.useJSXTextNode) {
      extra.useJSXTextNode = true;
    }

    /**
     * Allow the user to override the function used for logging
     */
    if (typeof options.loggerFn === 'function') {
      extra.log = options.loggerFn;
    } else if (options.loggerFn === false) {
      extra.log = Function.prototype;
    }

    if (typeof options.project === 'string') {
      extra.projects = [options.project];
    } else if (
      Array.isArray(options.project) &&
      options.project.every(projectPath => typeof projectPath === 'string')
    ) {
      extra.projects = options.project;
    }

    if (typeof options.tsconfigRootDir === 'string') {
      extra.tsconfigRootDir = options.tsconfigRootDir;
    }
  }

  if (!isRunningSupportedTypeScriptVersion && !warnedAboutTSVersion) {
    const border = '=============';
    const versionWarning = [
      border,
      'WARNING: You are currently running a version of TypeScript which is not officially supported by typescript-estree.',
      'You may find that it works just fine, or you may not.',
      `SUPPORTED TYPESCRIPT VERSIONS: ${SUPPORTED_TYPESCRIPT_VERSIONS}`,
      `YOUR TYPESCRIPT VERSION: ${ACTIVE_TYPESCRIPT_VERSION}`,
      'Please only submit bug reports when using the officially supported version.',
      border
    ];
    extra.log(versionWarning.join('\n\n'));
    warnedAboutTSVersion = true;
  }

  const shouldProvideParserServices =
    shouldGenerateServices && extra.projects && extra.projects.length > 0;
  const { ast, program } = getProgramAndAST(
    code,
    options,
    shouldProvideParserServices
  );

  extra.code = code;
  const { estree, astMaps } = convert(ast, extra, shouldProvideParserServices);
  return {
    estree,
    program: shouldProvideParserServices ? program : undefined,
    astMaps: shouldProvideParserServices
      ? astMaps!
      : { esTreeNodeToTSNodeMap: undefined, tsNodeToESTreeNodeMap: undefined }
  };
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

export { AST_NODE_TYPES } from './ast-node-types';
export { version };

const version = packageJSON.version;

export function parse<T extends ParserOptions = ParserOptions>(
  code: string,
  options?: T
) {
  return generateAST<T>(code, options).estree;
}

export function parseAndGenerateServices(code: string, options: ParserOptions) {
  const result = generateAST(code, options, /*shouldGenerateServices*/ true);
  return {
    ast: result.estree,
    services: {
      program: result.program,
      esTreeNodeToTSNodeMap: result.astMaps.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: result.astMaps.tsNodeToESTreeNodeMap
    }
  };
}
