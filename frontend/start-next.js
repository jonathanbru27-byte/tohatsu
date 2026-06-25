#!/usr/bin/env node
// This script acts as a wrapper to run Next.js dev server
// It ignores any additional arguments passed by supervisor (like "start --port 3000")
const { spawn } = require('child_process');
const path = require('path');

// Run Next.js dev server
const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
const args = ['dev', '--port', '3000', '--hostname', '0.0.0.0'];

const child = spawn('node', [nextBin, ...args], {
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
