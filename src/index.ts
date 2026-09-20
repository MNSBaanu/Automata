import type { Rule } from "./core.js";
import { schedule } from "./scheduler.js";
import { load, save } from "./store.js";

const STATE_FILE = ".automata/issues.json";
const INTERVAL_MS = 5000;

type Issues = Record<string, string>;

const seed: Issues = { "issue-1": "open", "issue-2": "closed" };

const mirrorStatus: Rule<Issues> = {
  name: "mirror-status",
  observe: () => load(STATE_FILE, seed),
  desired: (state) =>
    Object.fromEntries(Object.entries(state).map(([k, v]) => [k, v === "closed" ? "done" : v])),
  apply: (_from, to) => save(STATE_FILE, to),
};

const stop = schedule([mirrorStatus], INTERVAL_MS, (results) => {
  const at = new Date().toISOString().slice(11, 19);
  for (const r of results) {
    const outcome = r.error ? `error - ${r.error.message}` : r.changed ? "converged" : "no drift";
    console.log(`${at} ${r.rule}: ${outcome}`);
  }
});

process.on("SIGINT", () => {
  stop();
  process.exit(0);
});
