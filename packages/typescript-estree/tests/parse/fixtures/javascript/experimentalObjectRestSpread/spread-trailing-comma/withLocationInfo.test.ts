import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
