import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/conditional-with-null.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
