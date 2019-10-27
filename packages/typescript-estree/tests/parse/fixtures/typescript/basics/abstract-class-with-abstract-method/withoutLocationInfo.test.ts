import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/abstract-class-with-abstract-method.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
