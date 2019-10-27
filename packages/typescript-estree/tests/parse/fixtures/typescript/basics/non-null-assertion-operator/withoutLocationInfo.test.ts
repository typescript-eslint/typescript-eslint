import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/non-null-assertion-operator.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
