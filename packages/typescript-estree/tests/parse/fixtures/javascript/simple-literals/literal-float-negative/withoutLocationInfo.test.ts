import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/simple-literals/literal-float-negative.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
