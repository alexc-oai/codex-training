import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = process.cwd();
const TEST_FILE_PATH = fileURLToPath(import.meta.url);
const IGNORED_DIRS = new Set([".git", "node_modules"]);
const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".txt"
]);
const REMOVED_BRAND_WITH_HYPHEN = ["t", "-", "mobile"].join("");
const REMOVED_BRAND_COMPACT = ["t", "mobile"].join("");
const REMOVED_SESSION_CODE = ["T", "M", "O", "-", "Q", "U", "E", "S", "T", "-", "1", "0", "1"].join("");
const BRAND_PATTERNS = [
  new RegExp(REMOVED_BRAND_WITH_HYPHEN, "i"),
  new RegExp(REMOVED_BRAND_COMPACT, "i"),
  new RegExp(REMOVED_SESSION_CODE)
];

function collectFiles(directory) {
  const entries = readdirSync(directory).sort();
  const files = [];

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) {
      continue;
    }

    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

test("repository source files and filenames are free of removed client branding", () => {
  const files = collectFiles(ROOT_DIR);
  const matches = [];

  for (const absolutePath of files) {
    if (absolutePath === TEST_FILE_PATH) {
      continue;
    }

    const relativePath = path.relative(ROOT_DIR, absolutePath);

    if (BRAND_PATTERNS.some((pattern) => pattern.test(relativePath))) {
      matches.push(`filename:${relativePath}`);
      continue;
    }

    const extension = path.extname(relativePath);
    if (!TEXT_FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    const contents = readFileSync(absolutePath, "utf8");
    if (BRAND_PATTERNS.some((pattern) => pattern.test(contents))) {
      matches.push(`content:${relativePath}`);
    }
  }

  assert.deepEqual(matches, []);
});
