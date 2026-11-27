import { cft } from 'console-fail-test';

// Faster than the default, which creates a `vi.fn()` for every console method before each test.
cft({ spyLibrary: 'fallback' });
