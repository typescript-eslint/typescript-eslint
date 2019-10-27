import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/class-decorators/class-decorator-factory.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
