import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/this-type-expanded.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
