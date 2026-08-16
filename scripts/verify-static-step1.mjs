import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "dist/public");
const requiredFiles = ["index.html", "vercel.json", "assets/portrait.jpg"];
const missing = requiredFiles.filter((relativePath) => !existsSync(join(root, relativePath)));

if (missing.length > 0) {
  console.error(`Static step 1 verification failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const html = readFileSync(join(root, "index.html"), "utf8");
if (!html.includes("/assets/")) {
  console.error("Static step 1 verification failed. index.html does not reference /assets/.");
  process.exit(1);
}

const vercelConfig = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
if (!Array.isArray(vercelConfig.rewrites) || vercelConfig.rewrites.length === 0) {
  console.error("Static step 1 verification failed. vercel.json has no rewrites.");
  process.exit(1);
}

console.log(`Static step 1 verification passed for ${root}`);
console.log(`Verified files: ${requiredFiles.join(", ")}`);
