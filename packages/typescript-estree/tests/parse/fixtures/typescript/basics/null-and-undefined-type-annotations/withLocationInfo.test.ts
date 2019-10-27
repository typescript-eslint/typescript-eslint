import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
