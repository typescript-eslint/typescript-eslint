export const dedupeTestCases = <T>(...caseArrays: (readonly T[])[]): T[] =>
  Object.values(
    Object.fromEntries(
      caseArrays.flat().map(testCase => [JSON.stringify(testCase), testCase]),
    ),
  );
