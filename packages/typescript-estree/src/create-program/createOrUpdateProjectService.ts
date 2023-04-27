import * as tsserver from 'typescript/lib/tsserverlibrary';

const doNothing = (): void => {};

const createStubFileWatcher = (): tsserver.FileWatcher => ({
  close: doNothing,
});

const SEEN_PROJECTS = new Set<string>([]);

let TSSERVER_PROJECT_SERVICE: ReturnType<
  typeof createOrUpdateProjectService
> | null = null;

export function clearTSServerProjectService(): void {
  SEEN_PROJECTS.clear();
  TSSERVER_PROJECT_SERVICE = null;
}

export function createOrUpdateProjectService(
  codeFullText: string,
  filePath: string,
  projectConfigFiles: string[] | null,
): tsserver.server.ProjectService {
  TSSERVER_PROJECT_SERVICE ??= createProjectService();

  if (projectConfigFiles) {
    for (const projectFileName of projectConfigFiles) {
      if (!SEEN_PROJECTS.has(projectFileName)) {
        SEEN_PROJECTS.add(projectFileName);
        TSSERVER_PROJECT_SERVICE.openExternalProject({
          options: {},
          projectFileName,
          rootFiles: [
            {
              content: codeFullText,
              fileName: filePath,
            },
          ],
        });
      }
    }
  }

  return TSSERVER_PROJECT_SERVICE;
}

function createProjectService(): tsserver.server.ProjectService {
  // TODO: see getWatchProgramsForProjects
  // We don't watch the disk, we just refer to these when ESLint calls us
  // there's a whole separate update pass in maybeInvalidateProgram at the bottom of getWatchProgramsForProjects
  // (this "goes nuclear on TypeScript")
  const system: tsserver.server.ServerHost = {
    ...tsserver.sys,
    clearImmediate,
    clearTimeout,
    setImmediate,
    setTimeout,
    watchDirectory: createStubFileWatcher,
    watchFile: createStubFileWatcher,
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
