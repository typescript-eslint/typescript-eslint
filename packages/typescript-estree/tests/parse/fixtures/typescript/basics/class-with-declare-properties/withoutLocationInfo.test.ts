import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-declare-properties.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
