const ts = require('typescript');

module.exports = {
  version: 1,
  resolveModuleNames: (
    moduleNames,
    containingFile,
    _reusedNames,
    _redirectedReferences,
    compilerOptions,
  ) => {
    const resolvedModules = [];

    for (const moduleName of moduleNames) {
      let parsedModuleName = moduleName;

      if (parsedModuleName === '__PLACEHOLDER__') {
        parsedModuleName = './something';
      }

      const resolution = ts.resolveModuleName(
        parsedModuleName,
        containingFile,
        compilerOptions,
        {
          fileExists: ts.sys.fileExists,
          readFile: ts.sys.readFile,
        },
      );

      resolvedModules.push(resolution.resolvedModule);
    }

    return resolvedModules;
  }
}
