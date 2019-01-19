export abstract class AbstractSocket {
    createSocket?(): Promise<string>;
}