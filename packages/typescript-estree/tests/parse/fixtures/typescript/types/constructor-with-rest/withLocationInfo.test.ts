import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
