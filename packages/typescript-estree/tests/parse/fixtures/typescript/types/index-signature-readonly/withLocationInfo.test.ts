import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/index-signature-readonly.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
