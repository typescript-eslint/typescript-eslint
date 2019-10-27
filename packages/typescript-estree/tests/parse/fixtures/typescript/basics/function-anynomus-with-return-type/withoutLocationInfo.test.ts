import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/function-anynomus-with-return-type.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
