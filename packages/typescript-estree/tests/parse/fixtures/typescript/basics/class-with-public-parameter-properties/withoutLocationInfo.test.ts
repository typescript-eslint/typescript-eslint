import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-public-parameter-properties.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
