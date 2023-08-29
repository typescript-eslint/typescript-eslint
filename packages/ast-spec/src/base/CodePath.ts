import type { TSESTree } from '@typescript-eslint/types';

/**
 * Part of the code path analysis feature of ESLint:
 * https://eslint.org/docs/latest/extend/code-path-analysis
 *
 * These are used in the `onCodePath*` methods. (Note that the `node` parameter
 * of these methods is intentionally omitted.)
 *
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/6993
 */
export interface CodePath {
  id: string;
  initialSegment: CodePathSegment;
  finalSegments: CodePathSegment[];
  returnedSegments: CodePathSegment[];
  thrownSegments: CodePathSegment[];
  currentSegments: CodePathSegment[];
  upper: CodePath | null;
  childCodePaths: CodePath[];
}

/**
 * Part of the code path analysis feature of ESLint:
 * https://eslint.org/docs/latest/extend/code-path-analysis
 *
 * These are used in the `onCodePath*` methods. (Note that the `node` parameter
 * of these methods is intentionally omitted.)
 *
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/6993
 */
export interface CodePathSegment {
  id: string;
  nextSegments: CodePathSegment[];
  prevSegments: CodePathSegment[];
  reachable: boolean;
}

/**
 * Part of the code path analysis feature of ESLint:
 * https://eslint.org/docs/latest/extend/code-path-analysis
 *
 * This type is unused in the `typescript-eslint` codebase since putting it on
 * the `nodeSelector` for `RuleListener` would break the existing definition.
 * However, it is exported here for the purposes of manual type-assertion.
 *
 * @see https://github.com/typescript-eslint/typescript-eslint/issues/6993
 */
export type CodePathFunction =
  | ((
      fromSegment: CodePathSegment,
      toSegment: CodePathSegment,
      node: TSESTree.Node,
    ) => void)
  | ((codePath: CodePath, node: TSESTree.Node) => void)
  | ((segment: CodePathSegment, node: TSESTree.Node) => void);
