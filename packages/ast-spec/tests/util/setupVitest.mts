import { serializers } from './serializers/index.js';

for (const serializer of serializers) {
  expect.addSnapshotSerializer(serializer);
}
