import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/typed-keyword-string.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
