export function parserPathSeemsToBeTSESLint(parserPath: string): boolean {
  return /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parserPath);
}
