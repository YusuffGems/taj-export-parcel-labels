// Generates out/sw.js after `next build`, precaching every exported file so the
// whole app (all pages + assets) works offline after the first visit.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";

const OUT = "out";
const SKIP = new Set(["sw.js", "_redirects", "404.html"]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const urls = new Set(["/"]);
const hash = createHash("sha1");
for (const file of walk(OUT).sort()) {
  const rel = relative(OUT, file).split(sep).join("/");
  if (SKIP.has(rel) || rel.endsWith(".map")) continue;
  hash.update(rel).update(readFileSync(file));
  if (rel === "index.html") urls.add("/");
  else if (rel.endsWith("/index.html")) urls.add("/" + rel.slice(0, -"index.html".length));
  else urls.add("/" + rel);
}

const template = readFileSync("scripts/sw-template.js", "utf8");
const sw = template
  .replace("__VERSION__", hash.digest("hex").slice(0, 12))
  .replace("__PRECACHE__", JSON.stringify([...urls].sort(), null, 2));
writeFileSync(join(OUT, "sw.js"), sw);
console.log(`Service worker generated: ${urls.size} files precached.`);
