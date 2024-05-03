export const dedupeTestCases = <T>(...caseArrays: (readonly T[])[]): T[] => {
  const cases = caseArrays.flat();
  const dedupedCases = Object.values(
    Object.fromEntries(
      cases.map(testCase => [JSON.stringify(testCase), testCase]),
    ),
  );
  if (cases.length === dedupedCases.length) {
    throw new Error(
      `\`dedupeTestCases\` is not necessary — no duplicate test cases detected!`,
    );
  }
  return dedupedCases;
};
