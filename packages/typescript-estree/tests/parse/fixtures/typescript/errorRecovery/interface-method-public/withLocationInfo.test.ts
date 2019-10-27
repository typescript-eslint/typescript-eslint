import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-method-public.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
