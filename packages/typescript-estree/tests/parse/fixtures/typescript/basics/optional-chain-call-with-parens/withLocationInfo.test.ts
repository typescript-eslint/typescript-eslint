import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/optional-chain-call-with-parens.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
