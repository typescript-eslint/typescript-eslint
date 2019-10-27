import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/optional-chain-element-access.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
