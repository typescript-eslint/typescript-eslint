import path from 'node:path';

/**
 * Infers the `tsconfigRootDir` from the current call stack, using the V8 API.
 * This appears to be available in current Deno and Bun as well.
 */
export function getTSConfigRootDirFromStack(): string | undefined {
  function getStack(): NodeJS.CallSite[] {
    const stackTraceLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;
    try {
      const prepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = (_, structuredStackTrace) =>
        structuredStackTrace;
      try {
        const dummyObject: { stack?: NodeJS.CallSite[] } = {};
        Error.captureStackTrace(dummyObject, getTSConfigRootDirFromStack);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- stack is set by captureStackTrace
        return dummyObject.stack!;
      } finally {
        Error.prepareStackTrace = prepareStackTrace;
      }
    } finally {
      Error.stackTraceLimit = stackTraceLimit;
    }
  }

  for (const callSite of getStack()) {
    const stackFrameFilePath = callSite.getFileName();
    if (!stackFrameFilePath) {
      continue;
    }

    const parsedPath = path.parse(stackFrameFilePath);

    // Check if the file name matches the ESLint config pattern
    if (/^eslint\.config\.(c|m)?(j|t)s$/.test(parsedPath.base)) {
      return parsedPath.dir;
    }
  }

  return undefined;
}
