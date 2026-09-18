// DevVegis — Neon Functions Web-Standard Entrypoint
import http from 'node:http';
import app from './app';

let serverReady: Promise<string> | null = null;

function getServerUrl(): Promise<string> {
  if (!serverReady) {
    serverReady = new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr) {
          resolve(`http://127.0.0.1:${addr.port}`);
        } else {
          reject(new Error('Failed to bind internal Express server'));
        }
      });
    });
  }
  return serverReady;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const baseUrl = await getServerUrl();
    const url = new URL(request.url);
    const targetUrl = `${baseUrl}${url.pathname}${url.search}`;

    const headers = new Headers(request.headers);
    headers.set('x-forwarded-host', url.host);
    headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
      // @ts-ignore
      init.duplex = 'half';
    }

    return fetch(targetUrl, init);
  },
};
