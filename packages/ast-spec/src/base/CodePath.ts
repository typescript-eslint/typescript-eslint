/**
 * Part of the code path analysis feature of ESLint:
 * https://eslint.org/docs/latest/extend/code-path-analysis
 *
 * These are used in the `onCodePathStart` and `onCodePathEnd` methods.
 *
 * Note that the `node` parameter of these methods is intentionally typed as
 * `never`: https://github.com/typescript-eslint/typescript-eslint/issues/6993
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
 * These are used in the `onCodePathStart` and `onCodePathEnd` methods.
 *
 * Note that the `node` parameter of these methods is intentionally typed as
 * `never`: https://github.com/typescript-eslint/typescript-eslint/issues/6993
 */
export interface CodePathSegment {
  id: string;
  nextSegments: CodePathSegment[];
  prevSegments: CodePathSegment[];
  reachable: boolean;
}
