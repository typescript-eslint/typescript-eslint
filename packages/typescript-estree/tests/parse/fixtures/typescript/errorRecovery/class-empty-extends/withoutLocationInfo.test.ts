import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/class-empty-extends.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
