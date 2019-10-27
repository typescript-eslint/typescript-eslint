import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-optional-methods.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
