#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Task Runner for Zotero Voyant Export
 * Provides various development and maintenance tasks
 */

import { exists } from "@std/fs";
import { join } from "@std/path";

/**
 * Clean build artifacts
 */
async function clean() {
  console.log("🧹 Cleaning...");

  const targets = [
    "build/",
    "lib/",
    "wasm/pkg/",
    "zotero-voyant-export.xpi",
    ".rescript/",
  ];

  for (const target of targets) {
    if (await exists(target)) {
      await Deno.remove(target, { recursive: true });
      console.log(`  ✓ Removed ${target}`);
    }
  }

  console.log("✅ Clean complete");
}

/**
 * Build WASM module
 */
async function wasm() {
  console.log("🦀 Building WASM...");

  const cmd = new Deno.Command("wasm-pack", {
    args: ["build", "wasm", "--target", "web", "--out-dir", "pkg"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await cmd.output();

  if (code !== 0) {
    throw new Error("WASM build failed");
  }

  console.log("✅ WASM built successfully");
}

/**
 * Build XPI package
 */
async function xpi() {
  console.log("📦 Building XPI...");

  const buildScript = new Deno.Command("deno", {
    args: ["run", "--allow-all", "build.ts"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await buildScript.output();

  if (code !== 0) {
    throw new Error("XPI build failed");
  }

  console.log("✅ XPI built successfully");
}

/**
 * Run RSR compliance checks
 */
async function rsrCheck() {
  console.log("🔍 Running RSR compliance checks...\n");

  const checks = {
    "README.adoc": "RSR-preferred AsciiDoc README",
    "LICENSE.txt": "Plain text license file",
    "GOVERNANCE.adoc": "Governance documentation",
    "FUNDING.yml": "Funding configuration (.yml)",
    "REVERSIBILITY.md": "Reversibility principles",
    "SECURITY.md": "Security policy",
    "CODE_OF_CONDUCT.md": "Code of Conduct",
    "CONTRIBUTING.md": "Contributing guidelines",
    "MAINTAINERS.md": "Maintainers list",
    "CHANGELOG.md": "Changelog",
    ".well-known/security.txt": "RFC 9116 security.txt",
    ".well-known/ai.txt": "AI training policies",
    ".well-known/humans.txt": "Human attribution",
    ".well-known/provenance.json": "Provenance chain",
    ".well-known/consent-required.txt": "HTTP 430 consent protocol",
  };

  let passed = 0;
  let failed = 0;

  for (const [file, description] of Object.entries(checks)) {
    if (await exists(file)) {
      console.log(`  ✅ ${file} - ${description}`);
      passed++;
    } else {
      console.log(`  ❌ ${file} - ${description} MISSING`);
      failed++;
    }
  }

  console.log(`\n📊 RSR Compliance: ${passed}/${passed + failed} checks passed`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} required files missing`);
    Deno.exit(1);
  } else {
    console.log("\n✅ Full RSR Gold compliance maintained!");
  }
}

/**
 * Show project statistics
 */
async function stats() {
  console.log("📈 Project Statistics\n");

  // Count files by type
  const counts: Record<string, number> = {
    "ReScript (.res)": 0,
    "JavaScript (.js)": 0,
    "TypeScript (.ts)": 0,
    "Rust (.rs)": 0,
    "Markdown (.md)": 0,
    "AsciiDoc (.adoc)": 0,
  };

  const patterns = {
    "ReScript (.res)": /\.res$/,
    "JavaScript (.js)": /\.js$/,
    "TypeScript (.ts)": /\.ts$/,
    "Rust (.rs)": /\.rs$/,
    "Markdown (.md)": /\.md$/,
    "AsciiDoc (.adoc)": /\.adoc$/,
  };

  async function countFiles(dir: string, pattern: RegExp): Promise<number> {
    let count = 0;
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isDirectory && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "build") {
          count += await countFiles(join(dir, entry.name), pattern);
        } else if (entry.isFile && pattern.test(entry.name)) {
          count++;
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
    return count;
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    counts[type] = await countFiles(".", pattern);
  }

  console.log("File Counts:");
  for (const [type, count] of Object.entries(counts)) {
    console.log(`  ${type}: ${count}`);
  }

  // Lines of code
  console.log("\nLines of Code:");
  const locTypes = [
    { ext: "res", label: "ReScript" },
    { ext: "js", label: "JavaScript" },
    { ext: "ts", label: "TypeScript" },
    { ext: "rs", label: "Rust" },
  ];

  for (const { ext, label } of locTypes) {
    try {
      const cmd = new Deno.Command("find", {
        args: [".", "-name", `*.${ext}`, "-not", "-path", "./node_modules/*", "-not", "-path", "./build/*", "-not", "-path", "./.rescript/*"],
        stdout: "piped",
      });

      const { stdout } = await cmd.output();
      const files = new TextDecoder().decode(stdout).trim().split("\n").filter((f) => f);

      if (files.length > 0 && files[0] !== "") {
        const wcCmd = new Deno.Command("wc", {
          args: ["-l", ...files],
          stdout: "piped",
        });

        const { stdout: wcOut } = await wcCmd.output();
        const output = new TextDecoder().decode(wcOut);
        const lines = output.split("\n");
        const total = lines[lines.length - 2]?.trim().split(/\s+/)[0] || "0";

        console.log(`  ${label}: ${total} lines`);
      } else {
        console.log(`  ${label}: 0 lines`);
      }
    } catch {
      console.log(`  ${label}: N/A`);
    }
  }

  console.log("");
}

/**
 * Security check - scan for exposed secrets
 */
async function securityCheck() {
  console.log("🔒 Running security checks...\n");

  const patterns = [
    "password\\s*=",
    "secret\\s*=",
    "api_key\\s*=",
    "token\\s*=",
    "private_key\\s*=",
  ];

  let issuesFound = 0;

  for (const pattern of patterns) {
    const cmd = new Deno.Command("git", {
      args: ["grep", "-i", "-n", pattern, "--", "*.js", "*.ts", "*.res", "*.json"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, code } = await cmd.output();

    if (code === 0) {
      const matches = new TextDecoder().decode(stdout);
      if (matches.trim()) {
        console.log(`⚠️  Potential secret found (${pattern}):`);
        console.log(matches);
        issuesFound++;
      }
    }
  }

  if (issuesFound === 0) {
    console.log("✅ No exposed secrets found");
  } else {
    console.log(`\n❌ ${issuesFound} potential security issues found`);
    Deno.exit(1);
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const task = Deno.args[0];

  const tasks: Record<string, () => Promise<void>> = {
    clean,
    wasm,
    xpi,
    "rsr-check": rsrCheck,
    stats,
    "security-check": securityCheck,
  };

  if (!task || task === "help") {
    console.log(`
Zotero Voyant Export - Task Runner

Available tasks:
  clean           - Remove build artifacts
  wasm            - Build WASM module
  xpi             - Build XPI package
  rsr-check       - Verify RSR compliance
  stats           - Show project statistics
  security-check  - Scan for exposed secrets
  help            - Show this help message

Usage:
  deno task <task-name>
  deno run --allow-all tasks.ts <task-name>

Examples:
  deno task clean
  deno task wasm
  deno task rsr-check
    `);
    return;
  }

  const taskFn = tasks[task];

  if (!taskFn) {
    console.error(`❌ Unknown task: ${task}`);
    console.log("Run 'deno task help' for available tasks");
    Deno.exit(1);
  }

  try {
    await taskFn();
  } catch (error) {
    console.error(`❌ Task failed: ${error.message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
