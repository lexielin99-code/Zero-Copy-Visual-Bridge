#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const FEEDBACK_FILE = path.join(process.cwd(), '.design_feedback.json');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && req.url === '/feedback') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const session = JSON.parse(body);
        const existing = fs.existsSync(FEEDBACK_FILE)
          ? JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'))
          : { sessions: [] };
        existing.sessions.push(session);
        fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(existing, null, 2));
        const n = session.changes?.length ?? 0;
        console.log(`[${new Date().toLocaleTimeString()}] saved ${n} change(s)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`✅ Visual Feedback receiver on :${PORT}`);
  console.log(`   Writing to: ${FEEDBACK_FILE}`);
});
