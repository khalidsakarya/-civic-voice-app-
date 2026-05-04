/**
 * Optional: proxy /api to a Vercel dev server so `npm start` can hit serverless routes.
 * Terminal 1: npx vercel dev --listen 3000
 * Terminal 2: REACT_APP_DEV_API_PROXY=http://127.0.0.1:3000 npm start
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  const target = process.env.REACT_APP_DEV_API_PROXY;
  if (!target) return;
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    }),
  );
};
