#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { watch } from "node:fs/promises";
import { resolve } from "node:path";
import { mdshot } from "./index.ts";

const args = process.argv.slice(2);
const watchMode = args.includes("--watch") || args.includes("-w");

let select: string | undefined;
let width: number | undefined;
let height: number | undefined;
let title: string | undefined;
let description: string | undefined;
const rest: string[] = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--watch" || arg === "-w") continue;
  if (arg === "--select" || arg === "-s") {
    select = args[++i];
    continue;
  }
  if (arg === "--width") {
    width = Number(args[++i]);
    continue;
  }
  if (arg === "--height") {
    height = Number(args[++i]);
    continue;
  }
  if (arg === "--title" || arg === "-t") {
    title = args[++i];
    continue;
  }
  if (arg === "--description" || arg === "-d") {
    description = args[++i];
    continue;
  }
  rest.push(arg);
}

async function resolveInput(input: string): Promise<{ markdown: string; outputPath: string; watchPath?: string; defaultTitle?: string; defaultDescription?: string }> {
  if (input === "npm:" || input === "gh:") {
    throw new Error(`Invalid input: "${input}" — missing package or repo name`);
  }
  const npmMatch = input.match(/^npm:(.+)$/);
  if (npmMatch) {
    const pkg = npmMatch[1]!;
    const res = await fetch(`https://registry.npmjs.org/${pkg}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch package "${pkg}": ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as { readme?: string; description?: string };
    if (!data.readme) {
      throw new Error(`Package "${pkg}" has no README`);
    }
    const outputPath = resolve(`${pkg.replace(/[/@]/g, "_")}.png`);
    return { markdown: data.readme, outputPath, defaultTitle: pkg, defaultDescription: data.description ?? undefined };
  }
  const ghMatch = input.match(/^gh:([^/]+\/.+)$/);
  if (input.startsWith("gh:") && !ghMatch) {
    throw new Error(`Invalid GitHub input: "${input}" — expected format: gh:owner/repo`);
  }
  if (ghMatch) {
    const repo = ghMatch[1]!;
    const [readmeRes, repoRes] = await Promise.all([
      fetch(`https://raw.githubusercontent.com/${repo}/HEAD/README.md`),
      fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }).catch(() => undefined),
    ]);
    if (!readmeRes.ok) {
      throw new Error(`Failed to fetch README: ${readmeRes.status} ${readmeRes.statusText}`);
    }
    const markdown = await readmeRes.text();
    const repoData = repoRes?.ok ? (await repoRes.json()) as { description?: string } : undefined;
    const outputPath = resolve(`${repo.replace(/[/@]/g, "_")}.png`);
    return { markdown, outputPath, defaultTitle: repo, defaultDescription: repoData?.description ?? undefined };
  }
  const inputPath = resolve(input);
  const markdown = readFileSync(inputPath, "utf8");
  const outputPath = resolve(rest[1] ? rest[1] : input.replace(/\.md$/, ".png"));
  return { markdown, outputPath, watchPath: inputPath };
}

const input = rest[0];

if (!input) {
  console.error("Usage: mdshot <input.md|npm:package|gh:owner/repo> [output.png] [--watch] [--select <pattern>] [--width <px>] [--height <px>] [--title <text>] [--description <text>]");
  process.exit(1);
}

const resolved = await resolveInput(input);
const outputPath = rest[1] ? resolve(rest[1]) : resolved.outputPath;

async function render() {
  const { markdown } = resolved.watchPath
    ? { markdown: readFileSync(resolved.watchPath, "utf8") }
    : resolved;
  const buf = await mdshot(markdown, { select, width, height, title: title ?? resolved.defaultTitle, description: description ?? resolved.defaultDescription });
  writeFileSync(outputPath, buf);
  console.log(`Screenshot saved to ${outputPath}`);
}

await render();

if (watchMode) {
  if (!resolved.watchPath) {
    console.error("Watch mode is not supported for remote inputs");
    process.exit(1);
  }
  console.log(`Watching ${resolved.watchPath} for changes...`);
  const watcher = watch(resolved.watchPath);
  for await (const event of watcher) {
    if (event.eventType === "change") {
      try {
        await render();
      } catch (err) {
        console.error("Render error:", err);
      }
    }
  }
}
