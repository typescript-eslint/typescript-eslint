import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/interface-property-with-default-value.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
