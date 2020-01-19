// The following code is adapted from the the code in eslint.
// License: https://github.com/eslint/eslint/blob/48700fc8408f394887cdedd071b22b757700fdcb/LICENSE

import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import { TokenOrComment } from './BinarySearchTree';

/**
 * A helper class to get token-based info related to indentation
 */
export class TokenInfo {
  private readonly sourceCode: TSESLint.SourceCode;
  public firstTokensByLineNumber: Map<number, TSESTree.Token>;

  constructor(sourceCode: TSESLint.SourceCode) {
    this.sourceCode = sourceCode;
    this.firstTokensByLineNumber = sourceCode.tokensAndComments.reduce(
      (map, token) => {
        if (!map.has(token.loc.start.line)) {
          map.set(token.loc.start.line, token);
        }
        if (
          !map.has(token.loc.end.line) &&
          sourceCode.text
            .slice(token.range[1] - token.loc.end.column, token.range[1])
            .trim()
        ) {
          map.set(token.loc.end.line, token);
        }
        return map;
      },
      new Map(),
    );
  }

  /**
   * Gets the first token on a given token's line
   * @returns The first token on the given line
   */
  public getFirstTokenOfLine(
    token: TokenOrComment | TSESTree.Node,
  ): TokenOrComment {
    return this.firstTokensByLineNumber.get(token.loc.start.line)!;
  }

  /**
   * Determines whether a token is the first token in its line
   * @returns `true` if the token is the first on its line
   */
  public isFirstTokenOfLine(token: TokenOrComment): boolean {
    return this.getFirstTokenOfLine(token) === token;
  }

  /**
   * Get the actual indent of a token
   * @param token Token to examine. This should be the first token on its line.
   * @returns The indentation characters that precede the token
   */
  public getTokenIndent(token: TokenOrComment): string {
    return this.sourceCode.text.slice(
      token.range[0] - token.loc.start.column,
      token.range[0],
    );
  }
}
