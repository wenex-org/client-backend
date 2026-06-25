import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AddressInfo } from 'net';
import * as http from 'http';
import request from 'supertest';

import { McpModule } from '../src/modules/mcp';

// A real upstream that records the inbound request and emits a delayed SSE stream.
function startUpstream() {
  let received: { method?: string; url?: string; headers?: http.IncomingHttpHeaders } = {};
  const server = http.createServer((req, res) => {
    received = { method: req.method, url: req.url, headers: req.headers };
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'mcp-session-id': 'srv-session-123',
    });
    res.write('data: first\n\n');
    setTimeout(() => {
      res.write('data: second\n\n');
      res.end();
    }, 100);
  });
  return {
    server,
    get received() {
      return received;
    },
  };
}

// Raw HTTP client that timestamps each received chunk (to prove streaming).
function collectChunks(port: number, headers: http.OutgoingHttpHeaders = {}) {
  return new Promise<{
    status?: number;
    headers: http.IncomingHttpHeaders;
    chunks: { t: number; s: string }[];
  }>((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: '/mcp', method: 'GET', headers }, (res) => {
      const start = Date.now();
      const chunks: { t: number; s: string }[] = [];
      res.on('data', (c) => chunks.push({ t: Date.now() - start, s: c.toString() }));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, chunks }));
    });
    req.on('error', reject);
    req.end();
  });
}

describe('McpController (e2e) — POST /mcp', () => {
  let app: INestApplication;
  let upstreamServer: http.Server;
  let received: { method?: string; headers?: http.IncomingHttpHeaders; body?: string } = {};

  beforeAll(async () => {
    upstreamServer = http.createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c.toString()));
      req.on('end', () => {
        received = { method: req.method, headers: req.headers, body };
        res.writeHead(200, { 'content-type': 'text/event-stream', 'mcp-session-id': 'srv-session-789' });
        res.write('data: post-first\n\n');
        setTimeout(() => {
          res.write('data: post-second\n\n');
          res.end();
        }, 50);
      });
    });
    await new Promise<void>((r) => upstreamServer.listen(0, r));
    process.env.PLATFORM_URL = `http://127.0.0.1:${(upstreamServer.address() as AddressInfo).port}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [McpModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((r) => upstreamServer.close(() => r()));
  });

  it('forwards the POST body upstream and streams the SSE response back', async () => {
    const payload = { jsonrpc: '2.0', id: 1, method: 'tools/list' };
    const res = await request(app.getHttpServer()).post('/mcp').set('Mcp-Session-Id', 'client-xyz').send(payload);

    // Request forwarded with body + session id.
    expect(received.method).toBe('POST');
    expect(JSON.parse(received.body ?? '{}')).toEqual(payload);
    expect(received.headers?.['mcp-session-id']).toBe('client-xyz');

    // Response streamed as SSE, session id bridged back, not buffered.
    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.headers['mcp-session-id']).toBe('srv-session-789');
    expect(res.headers['content-length']).toBeUndefined();
    expect(res.text).toContain('data: post-first');
    expect(res.text).toContain('data: post-second');
  });
});

describe('McpController (e2e) — GET /mcp', () => {
  let app: INestApplication;
  let appPort: number;
  let upstream: ReturnType<typeof startUpstream>;

  beforeAll(async () => {
    upstream = startUpstream();
    await new Promise<void>((r) => upstream.server.listen(0, r));
    const upstreamPort = (upstream.server.address() as AddressInfo).port;
    process.env.PLATFORM_URL = `http://127.0.0.1:${upstreamPort}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [McpModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
    appPort = (app.getHttpServer().address() as AddressInfo).port;
  });

  afterAll(async () => {
    await app.close();
    await new Promise<void>((r) => upstream.server.close(() => r()));
  });

  it('forwards the request to the upstream /mcp target', async () => {
    await request(app.getHttpServer()).get('/mcp');
    expect(upstream.received.method).toBe('GET');
    expect(upstream.received.url).toBe('/mcp');
    expect(upstream.received.headers?.['x-api-key']).toBeDefined();
  });

  it('propagates Mcp-Session-Id in both directions', async () => {
    const res = await request(app.getHttpServer()).get('/mcp').set('Mcp-Session-Id', 'client-abc');
    expect(upstream.received.headers?.['mcp-session-id']).toBe('client-abc');
    expect(res.headers['mcp-session-id']).toBe('srv-session-123');
  });

  it('streams the SSE response through without buffering', async () => {
    const res = await collectChunks(appPort);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/event-stream');
    // Not buffered: chunked transfer, no Content-Length.
    expect(res.headers['content-length']).toBeUndefined();
    // Two SSE events arrived as separate chunks, the second ~100ms later.
    expect(res.chunks.length).toBeGreaterThanOrEqual(2);
    expect(res.chunks.map((c) => c.s).join('')).toContain('data: first');
    expect(res.chunks.map((c) => c.s).join('')).toContain('data: second');
    expect(res.chunks[res.chunks.length - 1].t).toBeGreaterThanOrEqual(80);
  });
});
