import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-with-two-methods-computed-constructor.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
