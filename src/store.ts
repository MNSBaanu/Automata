import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";

export async function load<S>(path: string, fallback: S): Promise<S> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as S;
  } catch {
    return fallback;
  }
}

export async function save<S>(path: string, state: S): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, path);
}
