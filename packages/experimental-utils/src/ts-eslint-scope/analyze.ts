import { analyze as ESLintAnalyze } from 'eslint-scope';
import { EcmaVersion } from '../ts-eslint';
import { ScopeManager } from './ScopeManager';

interface AnalysisOptions {
  optimistic?: boolean;
  directive?: boolean;
  ignoreEval?: boolean;
  nodejsScope?: boolean;
  impliedStrict?: boolean;
  fallback?: string | ((node: {}) => string[]);
  sourceType?: 'script' | 'module';
  ecmaVersion?: EcmaVersion;
}
const analyze = ESLintAnalyze as (
  ast: {},
  options?: AnalysisOptions,
) => ScopeManager;

export { analyze, AnalysisOptions };
