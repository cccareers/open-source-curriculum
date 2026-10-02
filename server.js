/**
 * GitBook-style Course Content Player Server
 * Built with Node.js built-ins. Zero external dependencies.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanDirectory } from './lib/course-scanner.js';
import { parseMarkdown } from './lib/markdown-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

export class CoursePlayerServer {
  constructor(options = {}) {
    this.initialDir = options.dir || path.resolve(__dirname, 'catalogue', 'courses');
    this.currentDir = path.resolve(this.initialDir);
    this.port = options.port || 3000;
    this.host = options.host || '0.0.0.0';
    this.publicDir = path.resolve(__dirname, 'public');
    
    this.cachedScan = null;
    this.sseClients = new Set();
    this.watcher = null;
  }

  initWatcher() {
    if (this.watcher) {
      try { this.watcher.close(); } catch {}
    }

    try {
      if (fs.existsSync(this.currentDir)) {
        this.watcher = fs.watch(this.currentDir, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.md') || filename.endsWith('.mdx') || filename.endsWith('.json'))) {
            this.cachedScan = null;
            this.broadcastReload({ type: 'content-change', file: filename });
          }
        });
        if (this.watcher && typeof this.watcher.unref === 'function') {
          this.watcher.unref();
        }
      }
    } catch (err) {
      console.warn(`[Watcher Notice] Recursive watch not supported or failed for ${this.currentDir}:`, err.message);
    }
  }

  stop() {
    if (this.watcher) {
      try { this.watcher.close(); } catch {}
      this.watcher = null;
    }
    for (const res of this.sseClients) {
      try { res.end(); } catch {}
    }
    this.sseClients.clear();
  }

  broadcastReload(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of this.sseClients) {
      try {
        res.write(payload);
      } catch {
        this.sseClients.delete(res);
      }
    }
  }

  getScanData() {
    if (!this.cachedScan) {
      this.cachedScan = scanDirectory(this.currentDir);
    }
    return this.cachedScan;
  }

  setDirectory(newDir) {
    const resolved = path.resolve(newDir);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Directory does not exist: ${resolved}`);
    }
    this.currentDir = resolved;
    this.cachedScan = null;
    this.initWatcher();
    this.broadcastReload({ type: 'directory-change', newDir: this.currentDir });
    return this.getScanData();
  }

  start() {
    this.initWatcher();

    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${this.port} is busy, trying ${this.port + 1}...`);
        this.port += 1;
        server.listen(this.port, this.host);
      } else {
        console.error('Server error:', err);
      }
    });

    server.listen(this.port, this.host, () => {
      const displayHost = this.host === '0.0.0.0' ? 'localhost' : this.host;
      console.log('\n======================================================');
      console.log('   🎓 Course Catalog Content Player Started');
      console.log('======================================================');
      console.log(`   👉 Local URL:     http://${displayHost}:${this.port}`);
      console.log(`   📂 Content Path:  ${this.currentDir}`);
      console.log('======================================================\n');
    });

    return server;
  }

  async handleRequest(req, res) {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    // CORS headers for flexibility
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. SSE Live Reload
    if (pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('retry: 2000\n\n');
      this.sseClients.add(res);

      req.on('close', () => {
        this.sseClients.delete(res);
      });
      return;
    }

    // 2. API: Get Courses Tree
    if (pathname === '/api/courses' && req.method === 'GET') {
      try {
        const scan = this.getScanData();
        this.sendJson(res, 200, scan);
      } catch (err) {
        this.sendJson(res, 500, { error: err.message });
      }
      return;
    }

    // 3. API: Get Single Lesson Content
    if (pathname === '/api/lesson' && req.method === 'GET') {
      const courseId = reqUrl.searchParams.get('course');
      const lessonPath = reqUrl.searchParams.get('path');

      if (!courseId || !lessonPath) {
        this.sendJson(res, 400, { error: 'Missing course or path query parameters' });
        return;
      }

      try {
        const scan = this.getScanData();
        const course = scan.courses.find(c => c.id === courseId);
        if (!course) {
          this.sendJson(res, 404, { error: `Course not found: ${courseId}` });
          return;
        }

        const lessonMeta = course.flatLessons.find(l => l.relativePath === lessonPath || l.id === lessonPath);
        if (!lessonMeta) {
          this.sendJson(res, 404, { error: `Lesson not found: ${lessonPath}` });
          return;
        }

        const rawFileContent = fs.readFileSync(lessonMeta.filePath, 'utf8');
        const parsed = parseMarkdown(rawFileContent);

        this.sendJson(res, 200, {
          course: {
            id: course.id,
            title: course.title,
            banner: course.banner
          },
          lesson: lessonMeta,
          frontmatter: parsed.frontmatter,
          html: parsed.html,
          toc: parsed.toc,
          stats: parsed.stats,
          prev: lessonMeta.prev,
          next: lessonMeta.next
        });
      } catch (err) {
        this.sendJson(res, 500, { error: err.message });
      }
      return;
    }

    // 4. API: Get & Set Directory
    if (pathname === '/api/directory') {
      if (req.method === 'GET') {
        this.sendJson(res, 200, {
          currentDir: this.currentDir,
          exists: fs.existsSync(this.currentDir)
        });
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            if (!data.dir) {
              this.sendJson(res, 400, { error: 'Missing dir parameter in JSON body' });
              return;
            }
            const updated = this.setDirectory(data.dir);
            this.sendJson(res, 200, {
              success: true,
              currentDir: this.currentDir,
              coursesCount: updated.courses.length
            });
          } catch (err) {
            this.sendJson(res, 400, { error: err.message });
          }
        });
        return;
      }
    }

    // 5. Static Files from public directory
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '') {
      safePath = '/index.html';
    }

    const filePath = path.join(this.publicDir, safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback: Return index.html for unrecognized browser routes
    const indexHtmlPath = path.join(this.publicDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexHtmlPath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

  sendJson(res, statusCode, obj) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(obj, null, 2));
  }
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let customDir = null;
  let customPort = 3000;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' || args[i] === '-d') {
      customDir = args[++i];
    } else if (args[i] === '--port' || args[i] === '-p') {
      customPort = parseInt(args[++i], 10);
    }
  }

  const server = new CoursePlayerServer({ dir: customDir, port: customPort });
  server.start();
}
