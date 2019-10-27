import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-optional-property-undefined.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
