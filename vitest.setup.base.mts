import { cft } from 'console-fail-test';

// The default Vitest spy factory creates a `vi.fn()` for every console method
// before every test, which costs ~90µs per test (~5% of the eslint-plugin run).
// The fallback spy is a plain wrapper that records calls just the same.
cft({ spyLibrary: 'fallback' });
