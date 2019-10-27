import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/function-in-generic.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
