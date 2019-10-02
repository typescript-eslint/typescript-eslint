/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Use a jest snapshotResolver to map the test snapshot output back to the
 * linked volume. This means that even though we are running our tests inside
 * the docker container, the resulting snapshots will get written back to disk
 * on the host machine (i.e. your computer)! ✨
 */
module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    return testPath.replace('/usr/', '/usr/linked/') + snapshotExtension;
  },
  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    return snapshotFilePath
      .replace('/usr/linked/', '/usr/')
      .slice(0, -snapshotExtension.length);
  },
  testPathForConsistencyCheck: '/usr/test.js',
};
