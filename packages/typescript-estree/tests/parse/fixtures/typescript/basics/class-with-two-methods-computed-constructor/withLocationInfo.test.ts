import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
