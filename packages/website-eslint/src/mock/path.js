// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  let up = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe =
  /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^/]+?|)(\.[^./]*|))(?:[/]*)$/;
const splitPath = function (filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
export function resolve() {
  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(
    filter(resolvedPath.split('/'), function (p) {
      return !!p;
    }),
    !resolvedAbsolute,
  ).join('/');

  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}

// path.normalize(path)
// posix version
export function normalize(path) {
  let isPathAbsolute = isAbsolute(path);
  let trailingSlash = path.endsWith('/');

  // Normalize the path
  path = normalizeArray(
    filter(path.split('/'), function (p) {
      return !!p;
    }),
    !isPathAbsolute,
  ).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}

// posix version
export function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
export function join() {
  const paths = Array.prototype.slice.call(arguments, 0);
  return normalize(
    filter(paths, function (p) {
      if (typeof p !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }).join('/'),
  );
}

// path.relative(from, to)
// posix version
export function relative(from, to) {
  from = resolve(from).slice(1);
  to = resolve(to).slice(1);

  function trim(arr) {
    let start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') {
        break;
      }
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') {
        break;
      }
    }

    if (start > end) {
      return [];
    }
    return arr.slice(start, end - start + 1);
  }

  const fromParts = trim(from.split('/'));
  const toParts = trim(to.split('/'));

  const length = Math.min(fromParts.length, toParts.length);
  let samePartsLength = length;
  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  let outputParts = [];
  for (let i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

export const sep = '/';
export const delimiter = ':';

export function dirname(path) {
  const result = splitPath(path);
  const root = result[0];
  let dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.slice(0, -1);
  }

  return root + dir;
}

export function basename(path, ext) {
  let f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.slice(-1 * ext.length) === ext) {
    f = f.slice(0, f.length - ext.length);
  }
  return f;
}

export function extname(path) {
  return splitPath(path)[3];
}

export default {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve,
};

function filter(xs, f) {
  if (xs.filter) {
    return xs.filter(f);
  }
  const res = [];
  for (let i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs)) {
      res.push(xs[i]);
    }
  }
  return res;
}
