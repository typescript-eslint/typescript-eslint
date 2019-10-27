import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/basics/class-multi-line-keyword-declare.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
