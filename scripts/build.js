const { spawn } = require('child_process');
const path = require('path');

console.log('Building Next.js application...');

// Run Next.js build
const nextBuild = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, NODE_ENV: 'production' }
});

nextBuild.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    
    // Run export for static deployment
    console.log('Creating static export...');
    const nextExport = spawn('npx', ['next', 'export'], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    nextExport.on('close', (exportCode) => {
      if (exportCode === 0) {
        console.log('✅ Static export created in /out directory');
      } else {
        console.error('❌ Export failed with code', exportCode);
      }
    });
  } else {
    console.error('❌ Build failed with code', code);
  }
});

nextBuild.on('error', (error) => {
  console.error('Failed to run Next.js build:', error.message);
});
