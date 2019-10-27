import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/type-assertion-with-guard-in-function.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
