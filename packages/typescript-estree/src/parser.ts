/**
 * @fileoverview Parser that converts TypeScript into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import {
  calculateProjectParserOptions,
  createProgram
} from './tsconfig-parser';
import semver from 'semver';
import ts from 'typescript';
import convert from './ast-converter';
import { convertError } from './convert';
import { Program } from './estree/spec';
import { firstDefined } from './node-utils';
import {
  ESTreeComment,
  ESTreeToken,
  Extra,
  ParserOptions
} from './temp-types-based-on-js-source';
import { getFirstSemanticOrSyntacticError } from './semantic-errors';

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
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    code: '',
    tsconfigRootDir: process.cwd(),
    extraFileExtensions: []
  };
}

/**
 * @param {string} code The code of the file being linted
 * @param {Object} options The config object
 * @returns {{ast: ts.SourceFile, program: ts.Program} | undefined} If found, returns the source file corresponding to the code and the containing program
 */
function getASTFromProject(code: string, options: ParserOptions) {
  return firstDefined(
    calculateProjectParserOptions(
      code,
      options.filePath || getFileName(options),
      extra
    ),
    currentProgram => {
      const ast = currentProgram.getSourceFile(
        options.filePath || getFileName(options)
      );
      return ast && { ast, program: currentProgram };
    }
  );
}

/**
 * @param {string} code The code of the file being linted
 * @param {Object} options The config object
 * @returns {{ast: ts.SourceFile, program: ts.Program} | undefined} If found, returns the source file corresponding to the code and the containing program
 */
function getASTAndDefaultProject(code: string, options: ParserOptions) {
  const fileName = options.filePath || getFileName(options);
  const program = createProgram(code, fileName, extra);
  const ast = program && program.getSourceFile(fileName);
  return ast && { ast, program };
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
    (shouldProvideParserServices && getASTAndDefaultProject(code, options)) ||
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
 * @param code    TypeScript code
 * @param shouldGenerateServices Flag determining whether to generate ast maps and program or not
 * @param options configuration object for the parser
 * @returns the AST
 */
function generateAST<T extends ParserOptions = ParserOptions>(
  code: string,
  options: T = {} as T,
  shouldGenerateServices = false
): {
  estree: AST<T>;
  program: ts.Program | undefined;
  astMaps: {
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

    /**
     * Retrieve semantic and syntactic diagnostics from the underlying TypeScript Program
     * and turn them into parse errors
     */
    if (
      shouldGenerateServices &&
      typeof options.errorOnTypeScriptSyntacticAndSemanticIssues ===
        'boolean' &&
      options.errorOnTypeScriptSyntacticAndSemanticIssues
    ) {
      extra.errorOnTypeScriptSyntacticAndSemanticIssues = true;
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

    if (
      Array.isArray(options.extraFileExtensions) &&
      options.extraFileExtensions.every(ext => typeof ext === 'string')
    ) {
      extra.extraFileExtensions = options.extraFileExtensions;
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

  /**
   * Convert the AST
   */
  const { estree, astMaps } = convert(ast, extra, shouldProvideParserServices);

  /**
   * Even if TypeScript parsed the source code ok, and we had no problems converting the AST,
   * there may be other syntactic or semantic issues in the code that we can optionally report on.
   */
  if (program && extra.errorOnTypeScriptSyntacticAndSemanticIssues) {
    const error = getFirstSemanticOrSyntacticError(program, ast);
    if (error) {
      throw convertError(error);
    }
  }

  return {
    estree,
    program: shouldProvideParserServices ? program : undefined,
    astMaps: shouldProvideParserServices
      ? astMaps!
      : {
          esTreeNodeToTSNodeMap: undefined,
          tsNodeToESTreeNodeMap: undefined
        }
  };
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

export const version: string = packageJSON.version;

export function parse<T extends ParserOptions = ParserOptions>(
  code: string,
  options?: T
) {
  if (options && options.errorOnTypeScriptSyntacticAndSemanticIssues) {
    throw new Error(
      `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`
    );
  }
  return generateAST<T>(code, options).estree;
}

export interface ParserServices {
  program: ts.Program;
  esTreeNodeToTSNodeMap: WeakMap<object, any>;
  tsNodeToESTreeNodeMap: WeakMap<object, any>;
}
export function parseAndGenerateServices<T extends ParserOptions>(
  code: string,
  options: T
): {
  ast: AST<T>;
  services: ParserServices;
} {
  const result = generateAST(code, options, /*shouldGenerateServices*/ true);
  return {
    ast: result.estree,
    services: {
      program: result.program!,
      esTreeNodeToTSNodeMap: result.astMaps.esTreeNodeToTSNodeMap!,
      tsNodeToESTreeNodeMap: result.astMaps.tsNodeToESTreeNodeMap!
    }
  };
}

export { AST_NODE_TYPES } from './ast-node-types';
export { ParserOptions };
