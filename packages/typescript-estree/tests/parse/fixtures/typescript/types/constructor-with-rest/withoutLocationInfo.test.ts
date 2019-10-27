import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/constructor-with-rest.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
