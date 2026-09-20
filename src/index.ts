import { reconcileAll, type Rule } from "./core.js";

const store = new Map<string, string>([
  ["issue-1", "open"],
  ["issue-2", "closed"],
]);

const mirrorStatus: Rule<Record<string, string>> = {
  name: "mirror-status",
  observe: async () => Object.fromEntries(store),
  desired: (state) =>
    Object.fromEntries(Object.entries(state).map(([k, v]) => [k, v === "closed" ? "done" : v])),
  apply: async (_from, to) => {
    for (const [k, v] of Object.entries(to)) store.set(k, v);
  },
};

const results = await reconcileAll([mirrorStatus]);
for (const r of results) {
  console.log(`${r.rule}: ${r.error ? `error - ${r.error.message}` : r.changed ? "converged" : "no drift"}`);
}
console.log(Object.fromEntries(store));
