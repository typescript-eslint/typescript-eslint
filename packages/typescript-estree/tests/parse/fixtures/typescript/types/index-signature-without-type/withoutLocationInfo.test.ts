import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/index-signature-without-type.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
