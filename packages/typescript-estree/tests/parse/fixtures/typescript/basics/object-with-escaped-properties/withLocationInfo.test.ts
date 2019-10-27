import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/object-with-escaped-properties.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
