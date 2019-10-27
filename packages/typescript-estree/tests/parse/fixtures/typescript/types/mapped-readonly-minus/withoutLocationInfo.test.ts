import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/mapped-readonly-minus.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
