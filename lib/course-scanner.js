/**
 * Course Scanner
 * Traverses course directories, parses frontmatter, detects module and lesson
 * hierarchies, and calculates sequential previous/next pointers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.js';

export function scanDirectory(rootDir) {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Directory not found: ${rootDir}`);
  }

  const resolvedRoot = path.resolve(rootDir);
  const items = fs.readdirSync(resolvedRoot, { withFileTypes: true });

  // Check if root is a multi-course container (contains directories with markdown files)
  // or a single course itself.
  const subDirs = items.filter(d => d.isDirectory() && !d.name.startsWith('.'));
  const rootMarkdownFiles = items.filter(f => f.isFile() && isMarkdownFile(f.name));

  let courses = [];

  // Determine if subdirectories represent distinct courses
  const subDirCourses = [];
  for (const dir of subDirs) {
    const dirPath = path.join(resolvedRoot, dir.name);
    if (containsMarkdownFiles(dirPath)) {
      subDirCourses.push(scanSingleCourse(dirPath, dir.name));
    }
  }

  if (subDirCourses.length > 0) {
    // If there are also markdown files directly in root, treat root as an intro/overview course or merge
    if (rootMarkdownFiles.length > 0) {
      const rootCourse = scanSingleCourse(resolvedRoot, 'root-course', 'Main Course');
      courses = [rootCourse, ...subDirCourses];
    } else {
      courses = subDirCourses;
    }
  } else {
    // Single course directory
    const courseTitle = formatName(path.basename(resolvedRoot));
    courses = [scanSingleCourse(resolvedRoot, 'default-course', courseTitle)];
  }

  return {
    rootDir: resolvedRoot,
    scannedAt: new Date().toISOString(),
    courses
  };
}

/**
 * Scan a single course directory
 */
export function scanSingleCourse(courseDir, courseId, customTitle = null) {
  const courseName = customTitle || formatName(path.basename(courseDir));
  let courseDescription = '';
  let courseBanner = '';
  let courseDisplayId = '';
  let coursePathway = '';
  let courseHours = '';

  // Check for course.json or README.md metadata
  const metaJsonPath = path.join(courseDir, 'course.json');
  if (fs.existsSync(metaJsonPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaJsonPath, 'utf8'));
      if (meta.title) customTitle = meta.title;
      if (meta.description) courseDescription = meta.description;
      if (meta.banner) courseBanner = meta.banner;
      if (meta.course_id) courseDisplayId = meta.course_id;
      if (meta.pathway) coursePathway = meta.pathway;
      if (meta.hours) courseHours = meta.hours;
    } catch {}
  }

  const entries = fs.readdirSync(courseDir, { withFileTypes: true });
  const modulesMap = new Map();
  const flatLessons = [];

  // 1. Process files directly in the course folder
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryPath = path.join(courseDir, entry.name);

    if (entry.isFile() && isMarkdownFile(entry.name)) {
      const lesson = parseLessonFile(entryPath, courseDir, 'General');
      flatLessons.push(lesson);
    } else if (entry.isDirectory()) {
      // Module subdirectory
      const moduleName = formatName(entry.name);
      const subEntries = fs.readdirSync(entryPath, { withFileTypes: true });

      for (const sub of subEntries) {
        if (sub.isFile() && isMarkdownFile(sub.name)) {
          const subPath = path.join(entryPath, sub.name);
          const lesson = parseLessonFile(subPath, courseDir, moduleName);
          flatLessons.push(lesson);
        }
      }
    }
  }

  // Sort flat lessons by explicit order, then module, then filename
  flatLessons.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (a.module !== b.module) return a.module.localeCompare(b.module);
    return a.path.localeCompare(b.path);
  });

  // Calculate sequential Previous / Next links
  for (let i = 0; i < flatLessons.length; i++) {
    const current = flatLessons[i];
    if (i > 0) {
      const prev = flatLessons[i - 1];
      current.prev = {
        id: prev.id,
        title: prev.title,
        path: prev.relativePath,
        module: prev.module
      };
    } else {
      current.prev = null;
    }

    if (i < flatLessons.length - 1) {
      const next = flatLessons[i + 1];
      current.next = {
        id: next.id,
        title: next.title,
        path: next.relativePath,
        module: next.module
      };
    } else {
      current.next = null;
    }
  }

  // Group lessons by module
  flatLessons.forEach(lesson => {
    const mod = lesson.module || 'General';
    if (!modulesMap.has(mod)) {
      modulesMap.set(mod, {
        id: slugify(mod),
        title: mod,
        lessons: []
      });
    }
    modulesMap.get(mod).lessons.push(lesson);
  });

  const modules = Array.from(modulesMap.values());

  return {
    id: courseId || slugify(courseName),
    displayId: courseDisplayId,
    pathway: coursePathway,
    hours: courseHours,
    title: customTitle || courseName,
    description: courseDescription,
    banner: courseBanner,
    path: courseDir,
    totalLessons: flatLessons.length,
    modules,
    flatLessons
  };
}

/**
 * Parse an individual lesson file for metadata
 */
function parseLessonFile(filePath, baseCourseDir, defaultModule = 'General') {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter } = parseFrontmatter(content);

  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(baseCourseDir, filePath);
  const id = slugify(relativePath.replace(/\.(md|mdx)$/i, ''));

  // Determine Title: 1. frontmatter title, 2. First H1 `# Title`, 3. formatted filename
  let title = frontmatter.title;
  if (!title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    } else {
      title = formatName(fileName.replace(/\.(md|mdx)$/i, ''));
    }
  }

  // Determine Order: frontmatter order/index or leading numeric prefix (e.g. 01-intro.md)
  let order = 999;
  if (frontmatter.order !== undefined) {
    order = Number(frontmatter.order);
  } else if (frontmatter.index !== undefined) {
    order = Number(frontmatter.index);
  } else {
    const numPrefixMatch = fileName.match(/^(\d+)[-_]/);
    if (numPrefixMatch) {
      order = parseInt(numPrefixMatch[1], 10);
    }
  }

  const moduleName = frontmatter.module || frontmatter.chapter || frontmatter.section || defaultModule;

  return {
    id,
    title,
    description: frontmatter.description || '',
    order,
    module: moduleName,
    duration: frontmatter.duration || '5 min',
    difficulty: frontmatter.difficulty || '',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
    video: frontmatter.video || null,
    hasQuiz: /<Quiz/i.test(content),
    hasFlashcards: /<Flashcard/i.test(content),
    hasH5P: /<H5P/i.test(content),
    type: ext === '.mdx' ? 'mdx' : 'md',
    fileName,
    relativePath,
    filePath
  };
}

function isMarkdownFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext === '.md' || ext === '.mdx';
}

function containsMarkdownFiles(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      if (f.name.startsWith('.')) continue;
      if (f.isFile() && isMarkdownFile(f.name)) return true;
      if (f.isDirectory()) {
        const sub = path.join(dir, f.name);
        if (containsMarkdownFiles(sub)) return true;
      }
    }
  } catch {}
  return false;
}

function formatName(name) {
  return name
    .replace(/^\d+[-_]/, '') // remove leading numbers 01-, 02_
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
