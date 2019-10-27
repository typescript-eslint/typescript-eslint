import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/function-with-object-type-without-annotation.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
