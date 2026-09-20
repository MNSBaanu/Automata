export type Rule<S> = {
  name: string;
  observe: () => Promise<S>;
  desired: (state: S) => S;
  apply: (from: S, to: S) => Promise<void>;
  equal?: (a: S, b: S) => boolean;
};

export type ReconcileResult = {
  rule: string;
  changed: boolean;
  error?: Error;
};

export async function reconcile<S>(rule: Rule<S>): Promise<ReconcileResult> {
  const same = rule.equal ?? ((a: S, b: S) => JSON.stringify(a) === JSON.stringify(b));
  try {
    const actual = await rule.observe();
    const target = rule.desired(actual);
    if (same(actual, target)) return { rule: rule.name, changed: false };
    await rule.apply(actual, target);
    return { rule: rule.name, changed: true };
  } catch (error) {
    return { rule: rule.name, changed: false, error: error as Error };
  }
}

export async function reconcileAll(rules: Rule<any>[]): Promise<ReconcileResult[]> {
  return Promise.all(rules.map(reconcile));
}
