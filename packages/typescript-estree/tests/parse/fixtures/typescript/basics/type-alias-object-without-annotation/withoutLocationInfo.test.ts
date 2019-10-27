import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/type-alias-object-without-annotation.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
