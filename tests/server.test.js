import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleCourses } from './fixtures/sample-courses.js';
import { EventEmitter } from 'node:events';
import { CoursePlayerServer } from '../server.js';

test('Server End-to-End: handles API and lesson requests in-memory', async (t) => {
  const sampleDir = createSampleCourses(t);
  const server = new CoursePlayerServer({ dir: sampleDir });
  t.after(() => server.stop());

  // 1. Test GET /api/courses
  const coursesRes = await invokeHandler(server, 'GET', '/api/courses');
  assert.equal(coursesRes.statusCode, 200);
  const coursesData = JSON.parse(coursesRes.body);
  assert.ok(coursesData.courses.length >= 2, 'Found at least 2 courses');
  const fullstack = coursesData.courses.find(c => c.id.includes('fullstack'));
  assert.ok(fullstack, 'Fullstack course exists');

  // 2. Test GET /api/lesson for welcome lesson (YouTube video)
  const welcomeLesson = fullstack.flatLessons[0];
  const lesson1Res = await invokeHandler(
    server,
    'GET',
    `/api/lesson?course=${fullstack.id}&path=${welcomeLesson.relativePath}`
  );
  assert.equal(lesson1Res.statusCode, 200);
  const lesson1Data = JSON.parse(lesson1Res.body);
  assert.equal(lesson1Data.lesson.title, 'Welcome to Fullstack Web Engineering');
  assert.ok(lesson1Data.html.includes('iframe-video'), 'Renders responsive video player');
  assert.ok(lesson1Data.html.includes('youtube-nocookie.com/embed/'), 'Includes YouTube player');
  assert.ok(lesson1Data.next, 'Includes next lesson link');

  // 3. Test GET /api/lesson for closures lesson (Quiz and Flashcard)
  const closuresLesson = fullstack.flatLessons.find(l => l.id.includes('closures'));
  assert.ok(closuresLesson, 'Closures lesson exists');
  const closuresRes = await invokeHandler(
    server,
    'GET',
    `/api/lesson?course=${fullstack.id}&path=${closuresLesson.relativePath}`
  );
  assert.equal(closuresRes.statusCode, 200);
  const closuresData = JSON.parse(closuresRes.body);
  assert.ok(closuresData.html.includes('quiz-component'), 'Renders Quiz component');
  assert.ok(closuresData.html.includes('flashcard-container'), 'Renders Flashcard component');
  assert.ok(closuresData.html.includes('data-answer='), 'Includes quiz answer data');

  // 4. Test GET /api/lesson for H5P lesson
  const h5pLesson = fullstack.flatLessons.find(l => l.id.includes('h5p'));
  assert.ok(h5pLesson, 'H5P lesson exists');
  const h5pRes = await invokeHandler(
    server,
    'GET',
    `/api/lesson?course=${fullstack.id}&path=${h5pLesson.relativePath}`
  );
  assert.equal(h5pRes.statusCode, 200);
  const h5pData = JSON.parse(h5pRes.body);
  assert.ok(h5pData.html.includes('h5p-wrapper'), 'Renders H5P wrapper');
  assert.ok(h5pData.html.includes('h5p.org/h5p/embed/615'), 'Includes H5P iframe src');

  // 5. Test GET /index.html
  const indexRes = await invokeHandler(server, 'GET', '/');
  assert.equal(indexRes.statusCode, 200);
  assert.ok(indexRes.body.includes('<title>Course Content Player</title>'), 'Serves web UI');

});

function invokeHandler(server, method, url, postBody = null) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:3000' };

    const res = new EventEmitter();
    let body = '';
    let statusCode = 200;
    const headers = {};

    res.setHeader = (k, v) => { headers[k.toLowerCase()] = v; };
    res.writeHead = (code, hdrs) => {
      statusCode = code;
      if (hdrs) Object.assign(headers, hdrs);
    };
    res.write = (chunk) => { body += chunk; };
    res.end = (chunk) => {
      if (chunk) body += chunk;
      resolve({ statusCode, headers, body });
    };

    server.handleRequest(req, res);

    if (postBody) {
      req.emit('data', postBody);
    }
    req.emit('end');
  });
}
