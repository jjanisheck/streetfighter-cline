const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js development server...');

// Start Next.js dev server on port 3002 with legacy OpenSSL
const nextDev = spawn('npx', ['next', 'dev', '-p', '3002'], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  env: { 
    ...process.env, 
    NODE_ENV: 'development',
    NODE_OPTIONS: '--openssl-legacy-provider'
  }
});

nextDev.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});

nextDev.on('error', (error) => {
  console.error('Failed to start Next.js dev server:', error.message);
  console.log('Falling back to simple HTTP server...');
  
  // Fallback to basic server
  const http = require('http');
  const fs = require('fs');
  const url = require('url');
  
  const server = http.createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    const filePath = path.join(__dirname, '..', 'pages', pathname === '/' ? 'index.html' : pathname);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Page not found');
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
  });
  
  server.listen(3002, () => {
    console.log('Fallback server running on http://localhost:3002');
  });
});
