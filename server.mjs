import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  try {
    const requestPath = req.url === "/" ? "/index.html" : req.url;
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const absolutePath = path.join(__dirname, safePath);

    const content = await fs.readFile(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": mimeType,
      "Cache-Control": "no-store"
    });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Codex Quest running at http://${host}:${port}`);
});
