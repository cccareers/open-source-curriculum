import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../lib/frontmatter.js';
import { parseVideoUrl, renderVideoPlayer } from '../lib/video-helper.js';
import { parseMarkdown } from '../lib/markdown-parser.js';

test('Frontmatter Parser: extracts YAML header correctly', () => {
  const content = `---
title: "Mastering Node.js"
order: 2
tags: [node, backend]
completed: false
---
# Content starts here`;

  const { data, content: body } = parseFrontmatter(content);
  assert.equal(data.title, 'Mastering Node.js');
  assert.equal(data.order, 2);
  assert.deepEqual(data.tags, ['node', 'backend']);
  assert.equal(data.completed, false);
  assert.ok(body.includes('# Content starts here'));
});

test('Frontmatter Parser: folds wrapped list items onto the previous item', () => {
  const content = `---
objectives:
  - Demonstrate professional workplace skills: reliability, documentation,
    boundaries, and teamwork
  - Complete workplace documentation accurately
  - "Quoted: wrapped across
    two lines"
kind: lesson
---
Body`;
  const { data } = parseFrontmatter(content);
  assert.deepEqual(data.objectives, [
    'Demonstrate professional workplace skills: reliability, documentation, boundaries, and teamwork',
    'Complete workplace documentation accurately',
    'Quoted: wrapped across two lines'
  ]);
  assert.equal(data.kind, 'lesson');
});

test('Video Helper: identifies YouTube URLs', () => {
  const yt = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.ok(yt);
  assert.equal(yt.type, 'youtube');
  assert.equal(yt.id, 'dQw4w9WgXcQ');
  assert.ok(yt.embedUrl.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'));

  const shortYt = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(shortYt.type, 'youtube');
  assert.equal(shortYt.id, 'dQw4w9WgXcQ');
});

test('Video Helper: identifies Vimeo URLs', () => {
  const vimeo = parseVideoUrl('https://vimeo.com/76979871');
  assert.ok(vimeo);
  assert.equal(vimeo.type, 'vimeo');
  assert.equal(vimeo.id, '76979871');
});

test('Video Helper: identifies Direct MP4 URLs', () => {
  const mp4 = parseVideoUrl('https://cdn.example.com/videos/tutorial.mp4');
  assert.ok(mp4);
  assert.equal(mp4.type, 'direct');
  assert.equal(mp4.embedUrl, 'https://cdn.example.com/videos/tutorial.mp4');
});

test('Markdown Parser: renders video links as players', () => {
  const md = `
# Lesson With Video

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Some other text.
`;
  const result = parseMarkdown(md);
  assert.ok(result.html.includes('class="course-video-wrapper iframe-video"'));
  assert.ok(result.html.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'));
});

test('Markdown Parser: compiles MDX <Quiz /> component', () => {
  const mdx = `
<Quiz
  question="What is 2 + 2?"
  options={["3", "4", "5"]}
  answer={1}
  explanation="Basic math: 2 + 2 = 4"
/>
`;
  const result = parseMarkdown(mdx);
  assert.ok(result.html.includes('class="interactive-component quiz-component"'));
  assert.ok(result.html.includes('What is 2 + 2?'));
  assert.ok(result.html.includes('data-answer="1"'));
  assert.ok(result.html.includes('Basic math: 2 + 2 = 4'));
});

test('Markdown Parser: compiles MDX <Flashcard /> and <FlashcardDeck />', () => {
  const mdx = `
<Flashcard front="Term" back="Definition" hint="A clue" />

<FlashcardDeck
  title="Deck"
  cards={[
    { front: "F1", back: "B1" },
    { front: "F2", back: "B2" }
  ]}
/>
`;
  const result = parseMarkdown(mdx);
  assert.ok(result.html.includes('class="interactive-component flashcard-container"'));
  assert.ok(result.html.includes('class="interactive-component flashcard-deck-component"'));
  assert.ok(result.html.includes('Card <span class="deck-current-num">1</span> of 2'));
});

test('Markdown Parser: compiles MDX <H5P /> component', () => {
  const mdx = `
<H5P src="https://h5p.org/h5p/embed/615" title="Interactive Activity" />
`;
  const result = parseMarkdown(mdx);
  assert.ok(result.html.includes('class="interactive-component h5p-wrapper"'));
  assert.ok(result.html.includes('src="https://h5p.org/h5p/embed/615"'));
});

test('Markdown Parser: generates Table of Contents and anchors', () => {
  const md = `
# Main Header
## First Subheading
### Deeper Subheading
`;
  const result = parseMarkdown(md);
  assert.equal(result.toc.length, 2);
  assert.equal(result.toc[0].text, 'First Subheading');
  assert.equal(result.toc[0].id, 'first-subheading');
});
