const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'course-assets-raw', 'competency-course-builder', 'assessments');
const outDir = path.join(__dirname, 'catalogue');
const coursesOutDir = path.join(outDir, 'courses');
const competenciesOutDir = path.join(outDir, 'competencies');

// Clean and recreate output directories
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(coursesOutDir, { recursive: true });
fs.mkdirSync(competenciesOutDir, { recursive: true });

// Read all roles/pathways
const roles = fs.readdirSync(srcDir).filter(name => fs.statSync(path.join(srcDir, name)).isDirectory());

let courseCount = 0;
let catalogCount = 0;

for (const role of roles) {
  const rolePath = path.join(srcDir, role);
  
  // Copy catalog.json if it exists
  const catalogPath = path.join(rolePath, 'catalog.json');
  if (fs.existsSync(catalogPath)) {
    fs.copyFileSync(catalogPath, path.join(competenciesOutDir, `${role}.json`));
    catalogCount++;
  }

  // Iterate over courses
  const coursesPath = path.join(rolePath, 'courses');
  if (fs.existsSync(coursesPath)) {
    const courses = fs.readdirSync(coursesPath).filter(name => fs.statSync(path.join(coursesPath, name)).isDirectory());
    
    for (const courseId of courses) {
      const coursePath = path.join(coursesPath, courseId);
      const targetCoursePath = path.join(coursesOutDir, courseId);
      
      fs.mkdirSync(targetCoursePath, { recursive: true });
      
      // Copy course.json
      const courseJsonPath = path.join(coursePath, 'course.json');
      if (fs.existsSync(courseJsonPath)) {
        fs.copyFileSync(courseJsonPath, path.join(targetCoursePath, 'course.json'));
      }
      
      // Copy lessons directory recursively
      const lessonsPath = path.join(coursePath, 'lessons');
      if (fs.existsSync(lessonsPath)) {
        const targetLessonsPath = path.join(targetCoursePath, 'lessons');
        fs.mkdirSync(targetLessonsPath, { recursive: true });
        
        const lessons = fs.readdirSync(lessonsPath);
        for (const lesson of lessons) {
          fs.copyFileSync(path.join(lessonsPath, lesson), path.join(targetLessonsPath, lesson));
        }
      }
      
      courseCount++;
    }
  }
}

console.log(`Successfully extracted ${courseCount} courses and ${catalogCount} competency catalogs to ${outDir}`);
