import { TSESTree } from '@typescript-eslint/typescript-estree';
import { analyze as ESLintAnalyze } from 'eslint-scope';
// eslint-disable-next-line import/no-extraneous-dependencies
import { VisitorKeys } from 'eslint-visitor-keys';
import { ScopeManager } from './ScopeManager';
import { EcmaVersion } from '../ts-eslint';

interface AnalysisOptions {
  /**
   * Additional known visitor keys.
   */
  childVisitorKeys?: VisitorKeys;
  directive?: boolean;
  ecmaVersion?: EcmaVersion;
  /**
   * A kind of the fallback in order to encounter with unknown node.
   */
  fallback?: 'iteration' | ((node: {}) => string[]);
  /**
   * whether to check 'eval()' calls
   */
  ignoreEval?: boolean;
  /**
   * implied strict mode (if ecmaVersion >= 5).
   */
  impliedStrict?: boolean;
  /**
   * whether the whole script is executed under node.js environment.
   * When enabled, eslint-scope adds a function scope immediately following the global scope.
   */
  nodejsScope?: boolean;
  optimistic?: boolean;
  sourceType?: 'script' | 'module';
}
const analyze = ESLintAnalyze as <TAST extends {} = TSESTree.Program>(
  ast: TAST,
  options?: AnalysisOptions,
) => ScopeManager;

export { analyze, AnalysisOptions };
