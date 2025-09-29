export function parserSeemsToBeTSESLint(parser: string | undefined): boolean {
  return !!parser && /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parser);
}
