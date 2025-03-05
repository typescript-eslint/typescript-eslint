import semver from 'semver';

import type * as Parser from '../../src/parser';

vi.mock('semver');

describe('Warn on unsupported TypeScript version', () => {
  let parser: typeof Parser;

  const semverSatisfiesMock = vi.mocked(semver.satisfies);

  beforeEach(async () => {
    parser = await import('../../src/parser.js');
  });
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should warn the user if they are using an unsupported TypeScript version', () => {
    semverSatisfiesMock.mockReturnValueOnce(false);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('process', { ...process, stdout: { isTTY: true } });

    parser.parse('');
    expect(console.log).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(
        'WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.',
      ),
    );
  });

  it('should warn the user if they are running on a non TTY process and a custom loggerFn was passed', () => {
    semverSatisfiesMock.mockReturnValueOnce(false);
    const loggerFn = vi.fn();
    vi.stubGlobal('process', { ...process, stdout: { isTTY: false } });

    parser.parse('', {
      loggerFn,
    });
    expect(loggerFn).toHaveBeenCalledOnce();
  });

  it('should not warn the user if they are running on a non TTY process and a custom loggerFn was not passed', () => {
    semverSatisfiesMock.mockReturnValueOnce(false);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal('process', { ...process, stdout: { isTTY: false } });

    parser.parse('');
    expect(console.log).not.toHaveBeenCalled();
  });
});
