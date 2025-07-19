import path from 'node:path';

/**
 * Infers the `tsconfigRootDir` from the current call stack, using the V8 API.
 *
 * See https://v8.dev/docs/stack-trace-api
 *
 * This API is implemented in Deno and Bun as well.
 */
export function getTSConfigRootDirFromStack(): string | undefined {
  function getStack(): NodeJS.CallSite[] {
    const stackTraceLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;
    const prepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, structuredStackTrace) => structuredStackTrace;

    const dummyObject: { stack?: NodeJS.CallSite[] } = {};
    Error.captureStackTrace(dummyObject, getTSConfigRootDirFromStack);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- stack is set by captureStackTrace
    const rv = dummyObject.stack!;

    Error.prepareStackTrace = prepareStackTrace;
    Error.stackTraceLimit = stackTraceLimit;

    return rv;
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
