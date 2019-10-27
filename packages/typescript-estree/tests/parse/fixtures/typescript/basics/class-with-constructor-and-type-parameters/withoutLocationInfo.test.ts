import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-constructor-and-type-parameters.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
