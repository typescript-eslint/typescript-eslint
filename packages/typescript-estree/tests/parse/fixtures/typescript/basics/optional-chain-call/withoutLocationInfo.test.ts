import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/optional-chain-call.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
