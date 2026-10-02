#!/usr/bin/env node

/**
 * Course Player CLI
 * Usage:
 *   course-player [--dir <path>] [--port <number>] [--open]
 */

import path from 'node:path';
import { CoursePlayerServer } from '../server.js';

const args = process.argv.slice(2);
let dir = process.cwd();
let port = 3000;
let shouldOpen = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  } else if (arg === '--dir' || arg === '-d') {
    dir = args[++i];
  } else if (arg === '--port' || arg === '-p') {
    port = parseInt(args[++i], 10) || 3000;
  } else if (arg === '--open' || arg === '-o') {
    shouldOpen = true;
  } else if (!arg.startsWith('-')) {
    dir = arg;
  }
}

function printHelp() {
  console.log(`
🎓 Course Content Player CLI

Usage:
  npx course-player [options] [directory]

Options:
  -d, --dir <path>     Directory of markdown/mdx course files (default: current directory)
  -p, --port <number>  Port to run the HTTP server on (default: 3000)
  -o, --open           Automatically open browser
  -h, --help           Display this help screen

Examples:
  npx course-player
  npx course-player ./my-courses
  npx course-player --dir ./docs --port 8080
`);
}

const resolvedDir = path.resolve(dir);
const server = new CoursePlayerServer({ dir: resolvedDir, port });
server.start();
