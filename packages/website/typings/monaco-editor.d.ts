/**
 * As of monao@0.55.0, this is no longer exported:
 * https://github.com/microsoft/TypeScript-Website/blob/4559775016e7b2e9d598eae86c931cf6121d73c6/packages/playground-worker/types.d.ts#L48
 */
export interface TypeScriptWorker {
  getLibFiles?(): Promise<Record<string, string>>;
}
