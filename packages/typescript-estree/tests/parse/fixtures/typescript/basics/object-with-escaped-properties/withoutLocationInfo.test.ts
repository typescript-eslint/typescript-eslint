import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
