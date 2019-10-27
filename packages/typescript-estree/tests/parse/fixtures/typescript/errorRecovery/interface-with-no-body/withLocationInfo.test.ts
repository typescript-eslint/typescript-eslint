import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-with-no-body.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
