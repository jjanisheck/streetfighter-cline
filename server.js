const express = require('express');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Middleware to strip Range headers
  server.use((req, res, next) => {
    if (req.headers.range) {
      console.log('Stripping Range header from request:', req.url);
      delete req.headers.range;
    }
    next();
  });

  // Handle all requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3002;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});