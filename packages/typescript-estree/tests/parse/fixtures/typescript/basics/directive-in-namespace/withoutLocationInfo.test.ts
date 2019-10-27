import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/directive-in-namespace.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
