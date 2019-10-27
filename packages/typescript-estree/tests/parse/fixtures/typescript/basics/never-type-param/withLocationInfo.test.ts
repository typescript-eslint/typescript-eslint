import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/never-type-param.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
