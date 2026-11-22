// `unstubEnvs` and `unstubGlobals` only reset stubs before each test, so
// without isolation a file's last stubs would leak into the next file's imports.
afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
