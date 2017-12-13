export async function readFile(
  filename: string,
  options?: { flag?: string }
): Promise<Buffer>
export async function readFile(
  filename: string,
  options?: { encoding: BufferEncoding; flag?: string }
): Promise<string>
export async function readFile(
  filename: string,
  options?: { encoding?: string; flag?: string }
): Promise<Buffer | string> {
  // ...
}