import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/interface-with-construct-signature-with-parameter-accessibility.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
