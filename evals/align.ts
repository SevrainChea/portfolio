import { readFileSync } from "node:fs";

// Judge alignment — the harness's own quality gate. The LLM-judge is only
// trustworthy on unlabeled cases once it agrees with YOUR labels on a sample.
// Workflow: run `pnpm eval`, open the label-<ts>.csv, fill `human_scope` /
// `human_grounding` (pass/fail) while reading each trace, then:
//
//   pnpm eval:align evals/results/label-<ts>.csv
//
// Reads the judge's verdicts and your labels back out of the same CSV and
// reports, per dimension:
//   TPR — of the traces YOU passed, how many the judge also passed
//   TNR — of the traces YOU failed, how many the judge also failed
// TNR is the number to watch: a judge that misses real failures inflates every
// pass rate you'll ever report. Iterate the judge prompt until both are high.

const DIMENSIONS = ["scope", "grounding"] as const;

/** Minimal RFC-4180 parser — answers contain commas, quotes, and newlines. */
function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"' && raw[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && raw[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((f) => f !== "")) rows.push(row);
  }
  return rows;
}

/** Accept pass/fail in the spellings a spreadsheet session produces. */
function normalizeLabel(value: string): boolean | null {
  const v = value.trim().toLowerCase();
  if (["pass", "p", "true", "1", "yes", "y", "ok"].includes(v)) return true;
  if (["fail", "f", "false", "0", "no", "n", "ko"].includes(v)) return false;
  return null;
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: pnpm eval:align evals/results/label-<ts>.csv");
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const header = rows[0];
  const col = (name: string) => header.indexOf(name);
  const data = rows.slice(1);

  let anyLabels = false;
  for (const dim of DIMENSIONS) {
    const judgeCol = col(`judge_${dim}`);
    const humanCol = col(`human_${dim}`);
    const critiqueCol = col(`judge_${dim}_critique`);
    const idCol = col("id");

    const labeled = data
      .map((r) => ({
        id: r[idCol],
        judge: normalizeLabel(r[judgeCol] ?? ""),
        human: normalizeLabel(r[humanCol] ?? ""),
        critique: r[critiqueCol] ?? "",
      }))
      .filter((r) => r.judge !== null && r.human !== null);

    console.log(`\n${dim} — ${labeled.length} labeled trace(s)`);
    if (!labeled.length) {
      console.log(`  (fill human_${dim} with pass/fail to measure alignment)`);
      continue;
    }
    anyLabels = true;

    const humanPass = labeled.filter((r) => r.human);
    const humanFail = labeled.filter((r) => !r.human);
    const tp = humanPass.filter((r) => r.judge).length;
    const tn = humanFail.filter((r) => !r.judge).length;
    const agree = tp + tn;

    console.log(
      `  agreement ${agree}/${labeled.length} (${((100 * agree) / labeled.length).toFixed(1)}%)`,
    );
    console.log(
      `  TPR ${humanPass.length ? `${tp}/${humanPass.length}` : "n/a (no human-pass labels)"}` +
        `   TNR ${humanFail.length ? `${tn}/${humanFail.length}` : "n/a (no human-fail labels)"}`,
    );
    for (const r of labeled.filter((x) => x.judge !== x.human)) {
      console.log(
        `  ✗ ${r.id}: you=${r.human ? "pass" : "fail"} judge=${r.judge ? "pass" : "fail"} — ${r.critique}`,
      );
    }
  }

  if (anyLabels) {
    console.log(
      "\nIf agreement is low, iterate the judge prompt (evals/judge.ts) and re-run — do NOT trust unaligned judge verdicts.",
    );
  }
}

main();
