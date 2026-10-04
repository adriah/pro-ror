import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, ".vercel/output");
const source = path.join(root, "out");
await access(path.join(source, "index.html"));
await access(path.join(source, "takk.html"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, path.join(output, "static"), { recursive: true });

// A portable static deployment: only the verified export is uploaded.
// Keep the client preview out of search results, including its PDF/image assets.
const config = {
  version: 3,
  routes: [
    { src: "/(.*)", headers: { "X-Robots-Tag": "noindex, nofollow" }, continue: true },
    { src: "/_next/static/(.*)", headers: { "Cache-Control": "public, max-age=31536000, immutable" }, continue: true },
    { src: "/", dest: "/index.html" },
    { src: "/hire(?:\\.html|/)?", headers: { Location: "/#contact" }, status: 301 },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/404.html", status: 404 },
  ],
};
await writeFile(path.join(output, "config.json"), `${JSON.stringify(config, null, 2)}\n`);
console.log("Vercel static output prepared in .vercel/output");
