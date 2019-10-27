import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/function-with-object-destruction.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
