import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/function-with-object-type-with-optional-properties.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
