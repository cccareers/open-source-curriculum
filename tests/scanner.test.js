import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleCourses } from './fixtures/sample-courses.js';
import { scanDirectory } from '../lib/course-scanner.js';

test('Course Scanner: discovers courses, modules, and lessons', (t) => {
  const sampleDir = createSampleCourses(t);
  const result = scanDirectory(sampleDir);

  assert.ok(result.courses.length >= 2, 'Should find at least 2 courses');

  const fullstackCourse = result.courses.find(c => c.id.includes('fullstack'));
  assert.ok(fullstackCourse, 'Found Fullstack course');
  assert.equal(fullstackCourse.title, 'Fullstack Web Engineering');
  assert.ok(fullstackCourse.modules.length >= 3, 'Found modules');
  assert.ok(fullstackCourse.flatLessons.length >= 5, 'Found lessons');

  // Verify sequential Next & Previous linking
  const firstLesson = fullstackCourse.flatLessons[0];
  assert.equal(firstLesson.prev, null, 'First lesson has no previous');
  assert.ok(firstLesson.next, 'First lesson has next lesson');
  assert.equal(firstLesson.next.id, fullstackCourse.flatLessons[1].id);

  const secondLesson = fullstackCourse.flatLessons[1];
  assert.ok(secondLesson.prev, 'Second lesson has previous lesson');
  assert.equal(secondLesson.prev.id, firstLesson.id);
  assert.ok(secondLesson.next, 'Second lesson has next lesson');
});
