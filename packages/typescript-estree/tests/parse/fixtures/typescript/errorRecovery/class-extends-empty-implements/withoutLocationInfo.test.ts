import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/errorRecovery/class-extends-empty-implements.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
