import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalObjectRestSpread/spread-trailing-comma.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
