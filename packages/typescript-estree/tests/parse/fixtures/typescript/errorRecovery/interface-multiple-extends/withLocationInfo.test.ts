import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-multiple-extends.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
