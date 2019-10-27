import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/declare-class-with-optional-method.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
