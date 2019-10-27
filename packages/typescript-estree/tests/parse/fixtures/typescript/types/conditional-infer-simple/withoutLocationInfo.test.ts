import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/types/conditional-infer-simple.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
