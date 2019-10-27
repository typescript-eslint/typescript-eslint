import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/null-and-undefined-type-annotations.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
