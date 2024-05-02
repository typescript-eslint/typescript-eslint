let numCalls = 0;
export const dedupeTestCases = <T>(...caseArrays: (readonly T[])[]): T[] => {
  const cases = caseArrays.flat();
  const dedupedCases = Object.values(
    Object.fromEntries(
      cases.map(testCase => [JSON.stringify(testCase), testCase]),
    ),
  );
  numCalls++;
  if (cases.length === dedupedCases.length) {
    throw new Error(
      `Call #${numCalls} of \`dedupeTestCases\` is not necessary — no duplicate test cases detected!`,
    );
  }
  return dedupedCases;
};
