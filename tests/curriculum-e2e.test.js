import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { CoursePlayerServer } from '../server.js';

const affectedCourses = ['dm201', 'dm230', 'dm350', 'cyb120', 'cyb130', 'sn330', 'sn350', 'sn360', 'se310'];

test('Curriculum end-to-end: affected courses render and navigate over HTTP', async (t) => {
  const player = new CoursePlayerServer();
  const server = http.createServer((req, res) => player.handleRequest(req, res));
  t.after(() => {
    player.stop();
    server.closeAllConnections();
    return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${base}/api/courses`);
  assert.equal(response.status, 200);
  const { courses } = await response.json();

  for (const id of affectedCourses) {
    await t.test(id, async () => {
      const course = courses.find((entry) => entry.id === id);
      assert.ok(course, `${id}: discoverable in catalogue`);
      assert.ok(course.flatLessons.length > 0, `${id}: lessons discovered`);
      for (const [index, lesson] of course.flatLessons.entries()) {
        const params = new URLSearchParams({ course: course.id, path: lesson.relativePath });
        const rendered = await fetch(`${base}/api/lesson?${params}`);
        assert.equal(rendered.status, 200, `${id}: ${lesson.relativePath}`);
        const data = await rendered.json();
        assert.equal(data.lesson.title, lesson.title);
        assert.ok(data.html.trim().length > 0, `${id}: nonempty rendered lesson`);
        assert.equal(data.prev?.path ?? null, course.flatLessons[index - 1]?.relativePath ?? null);
        assert.equal(data.next?.path ?? null, course.flatLessons[index + 1]?.relativePath ?? null);
      }
    });
  }
});
