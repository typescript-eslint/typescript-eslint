import * as tsserver from 'typescript/lib/tsserverlibrary';

const doNothing = (): void => {};

const createStubFileWatcher = (): tsserver.FileWatcher => ({
  close: doNothing,
});

export function createProjectService(): tsserver.server.ProjectService {
  // TODO: see getWatchProgramsForProjects
  // We don't watch the disk, we just refer to these when ESLint calls us
  // there's a whole separate update pass in maybeInvalidateProgram at the bottom of getWatchProgramsForProjects
  // (this "goes nuclear on TypeScript")
  const system = {
    ...tsserver.sys,
    watchDirectory: createStubFileWatcher,
    watchFile: createStubFileWatcher,
    setTimeout,
    clearTimeout,
    setImmediate,
    clearImmediate,
  };

  const projectService = new tsserver.server.ProjectService({
    host: system,
    cancellationToken: { isCancellationRequested: (): boolean => false },
    useSingleInferredProject: false,
    useInferredProjectPerProjectRoot: false,
    // TODO: https://github.com/microsoft/TypeScript/issues/53803
    typingsInstaller: {
      attach: (): void => {},
      enqueueInstallTypingsRequest: (): void => {},
      installPackage: (): Promise<never> => {
        throw new Error('This should never be called.');
      },
      isKnownTypesPackageName: () => false,
      onProjectClosed: (): void => {},
      globalTypingsCacheLocation: '',
    },
    logger: {
      close: doNothing,
      endGroup: doNothing,
      getLogFileName: () => undefined,
      hasLevel: () => false,
      info: doNothing,
      loggingEnabled: () => false,
      msg: doNothing,
      perftrc: doNothing,
      startGroup: doNothing,
    },
    session: undefined,
  });

  return projectService;
}
