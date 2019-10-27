import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/function-with-array-destruction.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
