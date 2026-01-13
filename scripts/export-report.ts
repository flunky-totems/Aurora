/**
 * Aurora — export-report.ts
 * Converts console-style output into a small JSON report.
 *
 * Usage:
 *   node scripts/export-report.ts logs/run.log reports/latest.json
 *
 * Expected log format (flexible, line-based):
 *   [INFO] Network: base-sepolia
 *   [INFO] ChainId: 84532
 *   [INFO] RPC: https://sepolia.base.org
 *   [INFO] Explorer: https://sepolia.basescan.org
 *   [CHECK] RPC Connectivity: OK
 *   [CHECK] Latest Block: 12877421
 *   [CHECK] Code(exampleContract): 0x
 *   [STATUS] PASS
 */

import fs from "node:fs";
import path from "node:path";

type Report = {
  tool: "aurora";
  generatedAt: string;
  status: "PASS" | "FAIL" | "UNKNOWN";
  network: {
    key?: string;
    chainId?: number;
    rpc?: string;
    explorer?: string;
  };
  checks: Record<string, string | number>;
  probes: Record<string, any>;
  sourceLog: string;
};

function readFile(p: string): string {
  return fs.readFileSync(p, "utf8");
}

function writeFile(p: string, data: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data, "utf8");
}

function pickAfterColon(line: string): string | undefined {
  const idx = line.indexOf(":");
  if (idx === -1) return undefined;
  return line.slice(idx + 1).trim();
}

function normalizeOk(v: string): string {
  const upper = v.toUpperCase();
  if (upper === "OK" || upper === "PASS" || upper === "SUCCESS") return "OK";
  if (upper === "FAIL" || upper === "ERROR") return "FAIL";
  return v.trim();
}

function main() {
  const [, , logPath, outPath] = process.argv;

  if (!logPath || !outPath) {
    console.error("Usage: node scripts/export-report.ts <inputLog> <outputJson>");
    process.exit(1);
  }

  const raw = readFile(logPath);
  const lines = raw.split(/\r?\n/).filter(Boolean);

  const report: Report = {
    tool: "aurora",
    generatedAt: new Date().toISOString(),
    status: "UNKNOWN",
    network: {},
    checks: {},
    probes: {},
    sourceLog: logPath
  };

  for (const line of lines) {
    // Network metadata
    if (line.includes("Network:")) report.network.key = pickAfterColon(line);
    if (line.includes("ChainId:")) {
      const v = pickAfterColon(line);
      if (v) report.network.chainId = Number(v);
    }
    if (line.includes("RPC:")) report.network.rpc = pickAfterColon(line);
    if (line.includes("Explorer:")) report.network.explorer = pickAfterColon(line);

    // Status
    if (line.startsWith("[STATUS]")) {
      const v = pickAfterColon(line) ?? "";
      const upper = v.toUpperCase();
      if (upper === "PASS" || upper === "FAIL") report.status = upper as any;
    }

    // Checks like: [CHECK] RPC Connectivity: OK
    if (line.startsWith("[CHECK]")) {
      const rest = line.replace("[CHECK]", "").trim();
      const name = rest.split(":")[0]?.trim();
      const value = pickAfterColon(rest) ?? "";
      if (name) report.checks[name] = normalizeOk(value);
    }

    // Probes like: [PROBE] Balance(exampleEOA): 0
    if (line.startsWith("[PROBE]")) {
      const rest = line.replace("[PROBE]", "").trim();
      const key = rest.split(":")[0]?.trim();
      const value = pickAfterColon(rest);
      if (key) report.probes[key] = value ?? "";
    }
  }

  // Basic fallback status inference
  if (report.status === "UNKNOWN") {
    const anyFail = Object.values(report.checks).some((v) => String(v).toUpperCase() === "FAIL");
    const anyOk = Object.values(report.checks).some((v) => String(v).toUpperCase() === "OK");
    report.status = anyFail ? "FAIL" : anyOk ? "PASS" : "UNKNOWN";
  }

  writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(`Wrote report: ${outPath}`);
}

main();
