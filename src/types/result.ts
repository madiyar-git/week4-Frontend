export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export function isError<T>(r: Result<T>): r is { ok: false; error: string } {
  return !r.ok;
}
