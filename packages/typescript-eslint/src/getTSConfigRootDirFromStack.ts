import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
    const stackFrameFilePathOrUrl = callSite.getFileName();
    if (!stackFrameFilePathOrUrl) {
      continue;
    }

    // ESM seem to return a file URL, so we'll convert it to a file path.
    // AFAICT this isn't documented in the v8 API docs, but it seems to be the case.
    // See https://github.com/typescript-eslint/typescript-eslint/issues/11429
    const stackFrameFilePath = stackFrameFilePathOrUrl.startsWith('file://')
      ? fileURLToPath(stackFrameFilePathOrUrl)
      : stackFrameFilePathOrUrl;

    const parsedPath = path.parse(stackFrameFilePath);
    if (/^eslint\.config\.(c|m)?(j|t)s$/.test(parsedPath.base)) {
      return parsedPath.dir;
    }
  }

  return undefined;
}
