import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/union-intersection.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
