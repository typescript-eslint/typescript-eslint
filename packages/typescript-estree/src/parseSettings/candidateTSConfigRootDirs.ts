const candidateTSConfigRootDirs = new Set<string>();

export function addCandidateTSConfigRootDir(candidate: string): void {
  candidateTSConfigRootDirs.add(candidate);
}

export function clearCandidateTSConfigRootDirs(): void {
  candidateTSConfigRootDirs.clear();
}

export function getInferredTSConfigRootDir(): string {
  const entries = [...candidateTSConfigRootDirs];

  switch (entries.length) {
    case 0:
      return process.cwd();

    case 1:
      return entries[0];

    default:
      throw new Error(
        [
          'No tsconfigRootDir was set, and multiple candidate TSConfigRootDirs are present:',
          ...entries.map(candidate => ` - ${candidate}`),
          "You'll need to explicitly set tsconfigRootDir in your parser options.",
          'See: https://tseslint.com/parser-tsconfigrootdir',
        ].join('\n'),
      );
  }
}
