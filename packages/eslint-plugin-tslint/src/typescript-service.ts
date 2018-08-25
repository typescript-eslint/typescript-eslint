import { createService } from 'typescript-service';
import * as ts from 'typescript';

let service: ReturnType<typeof createService>;

type createServiceOptions = {
    configFile: string;
    compilerOptions?: ts.CompilerOptions;
};

export function typescriptService(options?: createServiceOptions) {
    if (service === undefined) {
        if (options === undefined) {
            throw new Error('Service is not yet created');
        }
        service = createService(options);
    }
    return service;
}
