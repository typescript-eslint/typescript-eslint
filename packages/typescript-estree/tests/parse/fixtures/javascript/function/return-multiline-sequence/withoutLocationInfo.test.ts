import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/function/return-multiline-sequence.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
