import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/abstract-class-with-abstract-properties.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
