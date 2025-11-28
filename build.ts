#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Deno Build Script for Zotero Voyant Export
 * Replaces jpm and npm build system
 *
 * This script:
 * 1. Compiles ReScript to JavaScript
 * 2. Builds WASM modules (optional)
 * 3. Creates XPI package for Firefox/Zotero
 * 4. Patches install.rdf for Zotero compatibility
 */

import { ensureDir, exists } from "@std/fs";
import { join } from "@std/path";
import { copy } from "@std/fs";

const VERSION = "1.0.0";
const BUILD_DIR = "./build";
const XPI_NAME = "zotero-voyant-export.xpi";

interface BuildOptions {
  clean?: boolean;
  wasm?: boolean;
  verbose?: boolean;
}

/**
 * Main build function
 */
async function build(options: BuildOptions = {}) {
  console.log("🚀 Starting Deno build process...\n");

  if (options.clean) {
    await clean();
  }

  // Step 1: Compile ReScript
  await compileReScript(options.verbose);

  // Step 2: Build WASM (optional)
  if (options.wasm) {
    await buildWasm(options.verbose);
  }

  // Step 3: Create XPI
  await createXPI(options.verbose);

  console.log("\n✅ Build complete!");
  console.log(`📦 Output: ${XPI_NAME}`);
}

/**
 * Compile ReScript files to JavaScript
 */
async function compileReScript(verbose = false) {
  console.log("📝 Compiling ReScript...");

  const rescriptExists = await exists("rescript.json");
  if (!rescriptExists) {
    console.log("⚠️  No rescript.json found, skipping ReScript compilation");
    return;
  }

  const cmd = ["rescript", "build"];
  if (verbose) {
    cmd.push("-verbose");
  }

  const process = new Deno.Command("rescript", {
    args: cmd.slice(1),
    stdout: verbose ? "inherit" : "piped",
    stderr: "inherit",
  });

  const { code } = await process.output();

  if (code !== 0) {
    throw new Error("ReScript compilation failed");
  }

  console.log("✓ ReScript compiled successfully");
}

/**
 * Build WASM module
 */
async function buildWasm(verbose = false) {
  console.log("🦀 Building WASM module...");

  const wasmDirExists = await exists("wasm/Cargo.toml");
  if (!wasmDirExists) {
    console.log("⚠️  No wasm/Cargo.toml found, skipping WASM build");
    return;
  }

  const cmd = [
    "wasm-pack",
    "build",
    "wasm",
    "--target",
    "web",
    "--out-dir",
    "pkg",
  ];

  const process = new Deno.Command("wasm-pack", {
    args: cmd.slice(1),
    stdout: verbose ? "inherit" : "piped",
    stderr: "inherit",
  });

  const { code } = await process.output();

  if (code !== 0) {
    throw new Error("WASM build failed");
  }

  console.log("✓ WASM built successfully");
}

/**
 * Create XPI package
 */
async function createXPI(verbose = false) {
  console.log("📦 Creating XPI package...");

  // Ensure build directory exists
  await ensureDir(BUILD_DIR);

  // Generate package.json from template
  await generatePackageJson();

  // Copy necessary files to build directory
  const filesToCopy = [
    "index.js",
    "lib",
    "install.rdf",
    "package.json",
    "icon.png",
    "icon64.png",
  ];

  for (const file of filesToCopy) {
    const srcPath = join(".", file);
    const destPath = join(BUILD_DIR, file);

    if (await exists(srcPath)) {
      try {
        const stat = await Deno.stat(srcPath);
        if (stat.isDirectory) {
          await copy(srcPath, destPath, { overwrite: true });
        } else {
          await Deno.copyFile(srcPath, destPath);
        }
        if (verbose) console.log(`  Copied: ${file}`);
      } catch (error) {
        if (verbose) console.log(`  Skipped: ${file} (${error.message})`);
      }
    }
  }

  // Create ZIP archive (XPI is just a renamed ZIP)
  await createZip(BUILD_DIR, XPI_NAME, verbose);

  // Patch install.rdf for Zotero compatibility
  await patchInstallRdf(verbose);

  console.log("✓ XPI created successfully");
}

/**
 * Generate package.json from template
 */
async function generatePackageJson() {
  const versionContent = await Deno.readTextFile("VERSION").catch(() => VERSION);
  const version = versionContent.trim();

  const pkg = {
    name: "zotero-voyant-export",
    title: "Zotero Voyant Export",
    id: "zotero-voyant-export@corajr.com",
    description: "Export Zotero collections to Voyant Tools",
    author: "Cora Johnson-Roberson",
    license: "GPL-3.0-or-later OR MIT OR Palimpsest-0.8",
    version: version,
    main: "index.js",
    engines: {
      firefox: ">=38.0a1",
      fennec: ">=38.0a1",
    },
    permissions: {
      "cross-domain-content": [
        "http://voyant-tools.org",
      ],
    },
  };

  await Deno.writeTextFile(
    join(BUILD_DIR, "package.json"),
    JSON.stringify(pkg, null, 2),
  );
}

/**
 * Create ZIP archive
 */
async function createZip(sourceDir: string, outputFile: string, verbose = false) {
  // Use system zip command
  const cmd = ["zip", "-r", "-q", join("..", outputFile), "."];

  const process = new Deno.Command("zip", {
    args: cmd.slice(1),
    cwd: sourceDir,
    stdout: verbose ? "inherit" : "piped",
    stderr: "inherit",
  });

  const { code } = await process.output();

  if (code !== 0) {
    throw new Error("ZIP creation failed");
  }
}

/**
 * Patch install.rdf for Zotero compatibility
 */
async function patchInstallRdf(verbose = false) {
  const patchFile = "install.rdf.patch";
  if (!(await exists(patchFile))) {
    if (verbose) console.log("  No install.rdf.patch found, skipping patch");
    return;
  }

  // Extract XPI
  const tempDir = await Deno.makeTempDir();
  const extractCmd = ["unzip", "-q", XPI_NAME, "-d", tempDir];

  const extractProcess = new Deno.Command("unzip", {
    args: extractCmd.slice(1),
    stdout: "piped",
    stderr: "inherit",
  });

  await extractProcess.output();

  // Apply patch
  const patchCmd = ["patch", join(tempDir, "install.rdf"), patchFile];

  const patchProcess = new Deno.Command("patch", {
    args: patchCmd.slice(1),
    stdout: verbose ? "inherit" : "piped",
    stderr: "inherit",
  });

  await patchProcess.output();

  // Re-create XPI
  await Deno.remove(XPI_NAME);
  await createZip(tempDir, XPI_NAME, verbose);

  // Cleanup
  await Deno.remove(tempDir, { recursive: true });

  if (verbose) console.log("  install.rdf patched");
}

/**
 * Clean build artifacts
 */
async function clean() {
  console.log("🧹 Cleaning build artifacts...");

  const dirsToClean = [BUILD_DIR, "lib", "wasm/pkg"];
  const filesToClean = [XPI_NAME];

  for (const dir of dirsToClean) {
    if (await exists(dir)) {
      await Deno.remove(dir, { recursive: true });
      console.log(`  Removed: ${dir}/`);
    }
  }

  for (const file of filesToClean) {
    if (await exists(file)) {
      await Deno.remove(file);
      console.log(`  Removed: ${file}`);
    }
  }

  console.log("✓ Clean complete");
}

// CLI handling
if (import.meta.main) {
  const args = Deno.args;
  const options: BuildOptions = {
    clean: args.includes("--clean") || args.includes("-c"),
    wasm: args.includes("--wasm") || args.includes("-w"),
    verbose: args.includes("--verbose") || args.includes("-v"),
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Zotero Voyant Export - Deno Build Script

Usage: deno task build [options]

Options:
  -c, --clean     Clean build artifacts before building
  -w, --wasm      Build WASM modules
  -v, --verbose   Verbose output
  -h, --help      Show this help message

Examples:
  deno task build                 # Standard build
  deno task build --clean --wasm  # Clean build with WASM
  deno task build -v              # Verbose build
    `);
    Deno.exit(0);
  }

  try {
    await build(options);
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}`);
    Deno.exit(1);
  }
}
