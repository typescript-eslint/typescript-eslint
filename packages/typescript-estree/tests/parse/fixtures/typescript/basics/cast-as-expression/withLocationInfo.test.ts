import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/cast-as-expression.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
