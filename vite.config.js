import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

// Vercel serverless 핸들러 (api/*.js)를 dev 서버에서도 호출 가능하게 하는 플러그인
// production에 영향 없음 — Vercel은 자체적으로 api/*.js 처리
function vercelApiDev() {
  // .env 직접 로드 — dev 시 process.env에 주입
  if (fs.existsSync('.env')) {
    fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2];
    });
  }
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = req.url?.match(/^\/api\/([a-zA-Z0-9_-]+)(\?|$)/);
        if (!m) return next();
        const apiPath = `/api/${m[1]}.js`;
        try {
          const mod = await server.ssrLoadModule(apiPath);
          const handler = mod.default;
          const mockRes = {
            statusCode: 200,
            _headers: {},
            setHeader(k, v) { this._headers[k] = v; return this; },
            status(c) { this.statusCode = c; return this; },
            json(body) {
              res.statusCode = this.statusCode;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              Object.entries(this._headers).forEach(([k, v]) => res.setHeader(k, v));
              res.end(JSON.stringify(body));
              return this;
            },
          };
          await handler(req, mockRes);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiDev()],
})
