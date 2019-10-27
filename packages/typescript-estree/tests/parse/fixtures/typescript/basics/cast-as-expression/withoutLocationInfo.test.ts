import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
