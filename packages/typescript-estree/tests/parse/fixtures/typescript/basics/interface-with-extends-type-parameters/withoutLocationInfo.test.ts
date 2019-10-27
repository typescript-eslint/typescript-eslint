import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/interface-with-extends-type-parameters.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
