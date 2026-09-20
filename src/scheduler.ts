import { reconcileAll, type ReconcileResult, type Rule } from "./core.js";

export function schedule(
  rules: Rule<any>[],
  intervalMs: number,
  onResults: (results: ReconcileResult[]) => void,
): () => void {
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;

  const tick = async () => {
    if (stopped) return;
    onResults(await reconcileAll(rules));
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };

  void tick();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
