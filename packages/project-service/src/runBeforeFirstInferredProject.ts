import type * as ts from 'typescript/lib/tsserverlibrary';

/**
 * Undocumented TypeScript method that creates each inferred ("default") project.
 * @see https://github.com/microsoft/TypeScript/blob/v6.0.3/src/server/editorServices.ts#L3394
 */
interface ServiceInternals {
  createInferredProject: (...args: unknown[]) => ts.server.InferredProject;
}

/**
 * Runs a callback once, right before the service creates its first inferred project.
 * Inferred projects read their compiler options when they're created.
 */
export function runBeforeFirstInferredProject(
  service: ts.server.ProjectService,
  callback: () => void,
): void {
  const serviceInternals = service as unknown as ServiceInternals;
  const createInferredProject = serviceInternals.createInferredProject;

  serviceInternals.createInferredProject = (...args) => {
    serviceInternals.createInferredProject = createInferredProject;
    callback();
    return createInferredProject.apply(service, args);
  };
}
