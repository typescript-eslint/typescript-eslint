import semver from 'semver';

import type * as Parser from '../../src/parser';

jest.mock('semver');

const resetIsTTY = process.stdout.isTTY;

describe('Warn on unsupported TypeScript version', () => {
  let parser: typeof Parser;

  beforeEach(async () => {
    // @ts-expect-error -- We don't support ESM imports of local code yet.
    parser = await import('../../src/parser.ts');
  });
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    process.stdout.isTTY = resetIsTTY;
  });

  it('should warn the user if they are using an unsupported TypeScript version', () => {
    (semver.satisfies as jest.Mock).mockReturnValue(false);
    jest.spyOn(console, 'log').mockImplementation();
    process.stdout.isTTY = true;

    parser.parse('');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree',
      ),
    );
  });

  it('should warn the user if they are running on a non TTY process and a custom loggerFn was passed', () => {
    (semver.satisfies as jest.Mock).mockReturnValue(false);
    const loggerFn = jest.fn();
    process.stdout.isTTY = false;

    parser.parse('', {
      loggerFn,
    });
    expect(loggerFn).toHaveBeenCalled();
  });

  it('should not warn the user if they are running on a non TTY process and a custom loggerFn was not passed', () => {
    (semver.satisfies as jest.Mock).mockReturnValue(false);
    jest.spyOn(console, 'log').mockImplementation();
    process.stdout.isTTY = false;

    parser.parse('');
    expect(console.log).not.toHaveBeenCalled();
  });
});
