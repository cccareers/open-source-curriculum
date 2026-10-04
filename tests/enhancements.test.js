import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from '../lib/frontmatter.js';

const coursesDir = path.resolve('catalogue', 'courses');
const enhancementsDir = path.resolve('enhancements');

const MEDIA_TYPES = new Set(['video-script', 'animation-storyboard']);

function loadCourse(courseId) {
  const meta = JSON.parse(fs.readFileSync(path.join(coursesDir, courseId, 'course.json'), 'utf8'));
  const objectives = new Set(meta.learning_objectives || []);
  const competencyIds = new Set();
  const lessonIds = new Set();
  for (const lesson of meta.lessons || []) {
    lessonIds.add(lesson.lesson_id);
    for (const o of lesson.objectives || []) objectives.add(o);
    for (const c of lesson.competency_ids || []) competencyIds.add(c);
  }
  return { meta, objectives, competencyIds, lessonIds };
}

function asList(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function enhancementCourseDirs() {
  if (!fs.existsSync(enhancementsDir)) return [];
  return fs.readdirSync(enhancementsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name);
}

function markdownFilesIn(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f));
}

test('Enhancements: every folder maps to an existing course', () => {
  for (const courseId of enhancementCourseDirs()) {
    assert.ok(
      fs.existsSync(path.join(coursesDir, courseId, 'course.json')),
      `enhancements/${courseId} has no matching catalogue/courses/${courseId}/course.json`
    );
  }
});

test('Enhancements: projects and media cite only existing objectives, competencies, and lessons', () => {
  for (const courseId of enhancementCourseDirs()) {
    const course = loadCourse(courseId);
    const files = [
      ...markdownFilesIn(path.join(enhancementsDir, courseId, 'projects')),
      ...markdownFilesIn(path.join(enhancementsDir, courseId, 'media')),
    ];

    for (const file of files) {
      const rel = path.relative(process.cwd(), file);
      const { data } = parseFrontmatter(fs.readFileSync(file, 'utf8'));

      assert.equal(data.course_id, courseId, `${rel}: course_id must be "${courseId}"`);

      const isProject = path.basename(path.dirname(file)) === 'projects';
      if (isProject) {
        assert.equal(data.kind, 'supplementary-project', `${rel}: kind must be supplementary-project`);
        assert.ok(String(data.project_id || '').startsWith(`${courseId}-x`), `${rel}: project_id must start with ${courseId}-x`);
      } else {
        assert.ok(MEDIA_TYPES.has(data.type), `${rel}: type must be video-script or animation-storyboard`);
      }

      const objectives = asList(data.objectives);
      assert.ok(objectives.length > 0, `${rel}: must cite at least one existing objective`);
      for (const objective of objectives) {
        assert.ok(course.objectives.has(objective), `${rel}: objective not found verbatim in course.json: "${objective}"`);
      }
      for (const id of asList(data.competency_ids)) {
        assert.ok(course.competencyIds.has(id), `${rel}: competency_id ${id} is not mapped anywhere in ${courseId}/course.json`);
      }
      for (const id of asList(data.related_lessons)) {
        assert.ok(course.lessonIds.has(id), `${rel}: related lesson ${id} does not exist`);
      }
    }
  }
});

test('Catalogue: lesson frontmatter objectives match course.json', () => {
  const courseIds = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const courseId of courseIds) {
    const { meta } = loadCourse(courseId);
    const lessonsDir = path.join(coursesDir, courseId, 'lessons');
    const lessons = new Map((meta.lessons || []).map(lesson => [lesson.lesson_id, lesson]));
    const seen = new Set();
    for (const file of markdownFilesIn(lessonsDir)) {
      const rel = `${courseId}/${path.basename(file)}`;
      const { data } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      assert.ok(lessons.has(data.lesson_id), `${rel}: unknown lesson_id ${data.lesson_id}`);
      assert.ok(!seen.has(data.lesson_id), `${rel}: duplicate lesson_id ${data.lesson_id}`);
      seen.add(data.lesson_id);
      assert.deepEqual(asList(data.objectives), lessons.get(data.lesson_id).objectives || [],
        `${rel}: frontmatter objectives drifted from course.json`);
    }
    for (const lessonId of lessons.keys()) {
      assert.ok(seen.has(lessonId), `${courseId}: lesson file missing for ${lessonId}`);
    }
  }
});
