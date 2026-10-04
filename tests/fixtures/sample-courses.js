import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Each test gets an independent fixture and registers cleanup before any writes.
export function createSampleCourses(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'course-player-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (relativePath, content) => {
    const file = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  write('fullstack/course.json', JSON.stringify({ title: 'Fullstack Web Engineering' }));
  write('fullstack/01-basics/01-welcome.md', `---
title: Welcome to Fullstack Web Engineering
order: 1
video: https://www.youtube.com/watch?v=dQw4w9WgXcQ
---
# Welcome
`);
  write('fullstack/01-basics/02-html.md', '---\norder: 2\n---\n# HTML');
  write('fullstack/02-javascript/03-closures.mdx', `---
order: 3
---
# Closures
<Quiz question="Which scope?" options={['Lexical', 'Global']} answer="0" />
<Flashcard front="Closure" back="A function with its lexical environment" />
`);
  write('fullstack/02-javascript/04-functions.md', '---\norder: 4\n---\n# Functions');
  write('fullstack/03-interactive/05-h5p.mdx', '# Interactive\n<H5P src="https://h5p.org/h5p/embed/615" />');
  write('design/01-intro.md', '# Design fundamentals');
  return root;
}
