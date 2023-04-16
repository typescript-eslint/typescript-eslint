import * as tsserver from 'typescript/lib/tsserverlibrary';

export function createProjectService() {
  const compilerOptions = { /* todo */ strict: true };
  const compilerHost = tsserver.createCompilerHost(compilerOptions, true);

  // TODO: see getWatchProgramsForProjects
  // We don't watch the disk, we just refer to these when ESLint calls us
  // there's a whole separate update pass in maybeInvalidateProgram at the bottom of getWatchProgramsForProjects
  // (this "goes nuclear on TypeScript")
  const watchFile = (
    path: string,
    callback: tsserver.FileWatcherCallback,
  ): tsserver.FileWatcher => {
    // todo (or just ... stub out?)
    return { close() {} };
  };

  const watchDirectory = (
    path: string,
    callback: tsserver.DirectoryWatcherCallback,
  ) => {
    // todo (or just ... stub out?)
    return { close() {} };
  };

  const system = {
    ...tsserver.sys,
    watchFile,
    watchDirectory,
    setTimeout,
    clearTimeout,
    setImmediate,
    clearImmediate,
  };

  const projectService = new tsserver.server.ProjectService({
    host: system,
    cancellationToken: { isCancellationRequested: () => false },
    useSingleInferredProject: false, // ???
    useInferredProjectPerProjectRoot: false, // ???
    typingsInstaller: {
      attach: () => {},
      enqueueInstallTypingsRequest: () => {},
      installPackage: async (): Promise<never> => {
        throw new Error('pls no');
      },
      isKnownTypesPackageName: () => false,
      onProjectClosed: () => {},
      globalTypingsCacheLocation: '',
    },
    logger: {
      close() {},
      hasLevel: () => false,
      loggingEnabled: () => false,
      perftrc() {},
      info() {},
      startGroup() {},
      endGroup() {},
      msg() {},
      getLogFileName: () => undefined,
    },
    session: undefined,
  });

  return projectService;
}
