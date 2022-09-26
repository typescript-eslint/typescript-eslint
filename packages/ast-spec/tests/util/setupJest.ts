import { addSerializer } from 'jest-specific-snapshot';

import { serializers } from './serializers';

for (const serializer of serializers) {
  // the jest types are wrong here
  expect.addSnapshotSerializer(serializer);
  addSerializer(serializer);
}
