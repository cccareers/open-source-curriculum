/**
 * Course Content Player Frontend Engine
 * GitBook-style interactive reader with MDX components hydration,
 * progress tracking, live reload, and keyboard navigation.
 */

(function () {
  'use strict';

  // State
  const state = {
    courses: [],
    currentCourse: null,
    currentLesson: null,
    completedLessons: new Set(),
    activeTocId: null,
    theme: localStorage.getItem('course_player_theme') || 'light',
    fontSize: parseInt(localStorage.getItem('course_player_font_size') || '16', 10),
    searchQuery: '',
    localFilesMap: null // For in-browser folder picker mode
  };

  // DOM Elements
  const elements = {
    body: document.body,
    catalogView: document.getElementById('catalog-view'),
    playerView: document.getElementById('player-view'),
    catalogGrid: document.getElementById('catalog-grid'),
    catalogSearch: document.getElementById('catalog-search'),
    catalogPathwayFilter: document.getElementById('catalog-pathway-filter'),
    backToCatalogBtn: document.getElementById('back-to-catalog-btn'),
    catalogChangeFolderBtn: document.getElementById('catalog-change-folder-btn'),
    catalogFolderName: document.getElementById('catalog-folder-name'),
    catalogThemeToggle: document.getElementById('catalog-theme-toggle'),
    sidebarNav: document.getElementById('sidebar-nav'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),
    mobileThemeToggle: document.getElementById('mobile-theme-toggle'),
    mobileTitle: document.getElementById('mobile-title'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    fontIncreaseBtn: document.getElementById('font-increase-btn'),
    fontDecreaseBtn: document.getElementById('font-decrease-btn'),
    fontResetBtn: document.getElementById('font-reset-btn'),
    tocToggleBtn: document.getElementById('toc-toggle-btn'),
    tocSidebar: document.getElementById('toc-sidebar'),
    tocNav: document.getElementById('toc-nav'),
    lessonScrollArea: document.getElementById('lesson-scroll-area'),
    breadcrumbs: document.getElementById('breadcrumbs'),
    lessonHeader: document.getElementById('lesson-header'),
    lessonTitle: document.getElementById('lesson-title'),
    lessonDescription: document.getElementById('lesson-description'),
    lessonMetaChips: document.getElementById('lesson-meta-chips'),
    lessonStatsBar: document.getElementById('lesson-stats-bar'),
    lessonBody: document.getElementById('lesson-body'),
    lessonFooter: document.getElementById('lesson-footer'),
    markCompletedCheckbox: document.getElementById('mark-completed-checkbox'),
    prevLessonBtn: document.getElementById('prev-lesson-btn'),
    prevLessonTitle: document.getElementById('prev-lesson-title'),
    nextLessonBtn: document.getElementById('next-lesson-btn'),
    nextLessonTitle: document.getElementById('next-lesson-title'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    progressPercent: document.getElementById('progress-percent'),
    progressCount: document.getElementById('progress-count'),
    lessonSearchInput: document.getElementById('lesson-search'),
    folderModal: document.getElementById('folder-modal'),
    closeFolderModal: document.getElementById('close-folder-modal'),
    folderPathForm: document.getElementById('folder-path-form'),
    folderPathInput: document.getElementById('folder-path-input'),
    localFolderPicker: document.getElementById('local-folder-picker'),
    modalStatusMsg: document.getElementById('modal-status-msg'),
    searchModal: document.getElementById('search-modal'),
    modalSearchInput: document.getElementById('modal-search-input'),
    searchModalResults: document.getElementById('search-modal-results'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // Initialize
  async function init() {
    loadSavedCompletedLessons();
    applyTheme(state.theme);
    applyFontSize(state.fontSize);
    setupEventListeners();
    setupHotReload();

    await loadInitialData();
  }

  // Load Completed Lessons from localStorage
  function loadSavedCompletedLessons() {
    try {
      const saved = localStorage.getItem('course_player_completed');
      if (saved) {
        state.completedLessons = new Set(JSON.parse(saved));
      }
    } catch {}
  }

  function saveCompletedLessons() {
    try {
      localStorage.setItem('course_player_completed', JSON.stringify(Array.from(state.completedLessons)));
    } catch {}
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    localStorage.setItem('course_player_theme', theme);
    elements.body.className = `theme-${theme}`;

    const icon = theme === 'dark' ? '☀️' : '🌙';
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.querySelector('.theme-icon').textContent = icon;
    }
    if (elements.mobileThemeToggle) {
      elements.mobileThemeToggle.querySelector('.theme-icon').textContent = icon;
    }
    if (elements.catalogThemeToggle) {
      elements.catalogThemeToggle.querySelector('.theme-icon').textContent = icon;
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Font Size Management
  function applyFontSize(size) {
    state.fontSize = Math.min(Math.max(size, 13), 22);
    localStorage.setItem('course_player_font_size', state.fontSize.toString());
    document.documentElement.style.setProperty('--content-font-size', `${state.fontSize}px`);
  }

  // Fetch Courses and active directory
  async function loadInitialData() {
    try {
      const dirRes = await fetch('/api/directory');
      if (dirRes.ok) {
        const dirData = await dirRes.json();
        const shortName = dirData.currentDir.split(/[\/\\]/).pop() || 'Courses';
        if (elements.catalogFolderName) {
          elements.catalogFolderName.textContent = `Folder: ${shortName}`;
        }
        elements.folderPathInput.value = dirData.currentDir;
      }
    } catch {}

    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.courses = data.courses || [];

      if (state.courses.length === 0) {
        elements.catalogGrid.innerHTML = '';
        renderEmptyState('No courses or markdown files found in the current folder.');
        return;
      }

      // Populate pathway filter options
      if (elements.catalogPathwayFilter) {
        const pathways = new Set();
        state.courses.forEach(c => {
          if (c.pathway) pathways.add(c.pathway);
        });
        
        Array.from(pathways).sort().forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          elements.catalogPathwayFilter.appendChild(opt);
        });
        
        elements.catalogPathwayFilter.addEventListener('change', populateCatalog);
      }
      
      if (elements.catalogSearch) {
        elements.catalogSearch.addEventListener('input', populateCatalog);
      }

      populateCatalog();

      // Check URL parameters for course and lesson selection
      const urlParams = new URLSearchParams(window.location.search);
      const urlCourseId = urlParams.get('course');
      const urlLessonPath = urlParams.get('lesson');

      if (urlCourseId) {
        const initialCourse = state.courses.find(c => c.id === urlCourseId);
        if (initialCourse) {
          selectCourse(initialCourse, urlLessonPath);
          showPlayerView();
          return;
        }
      }
      
      showCatalogView();
    } catch (err) {
      console.error('Failed to load courses:', err);
      elements.catalogGrid.innerHTML = '';
      renderEmptyState(`Failed to connect to course server: ${err.message}`);
    }
  }

  function showCatalogView() {
    elements.playerView.style.display = 'none';
    elements.catalogView.style.display = 'flex';
    // Clear url query params
    history.replaceState(null, '', window.location.pathname);
    populateCatalog(); // refresh progress
  }

  function showPlayerView() {
    elements.catalogView.style.display = 'none';
    elements.playerView.style.display = 'flex';
  }

  function populateCatalog() {
    elements.catalogGrid.innerHTML = '';
    
    const searchTerm = elements.catalogSearch ? elements.catalogSearch.value.toLowerCase() : '';
    const pathwayFilter = elements.catalogPathwayFilter ? elements.catalogPathwayFilter.value : '';
    
    let filteredCourses = state.courses;
    
    if (searchTerm || pathwayFilter) {
      filteredCourses = state.courses.filter(c => {
        const matchesSearch = !searchTerm || 
          c.title.toLowerCase().includes(searchTerm) || 
          (c.description && c.description.toLowerCase().includes(searchTerm)) ||
          (c.displayId && c.displayId.toLowerCase().includes(searchTerm));
          
        const matchesPathway = !pathwayFilter || c.pathway === pathwayFilter;
        
        return matchesSearch && matchesPathway;
      });
    }

    if (filteredCourses.length === 0) {
      elements.catalogGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">No courses match your filters.</div>';
      return;
    }

    filteredCourses.forEach(course => {
      const card = document.createElement('div');
      card.className = 'catalog-course-card';
      
      const total = course.flatLessons.length;
      let completed = 0;
      course.flatLessons.forEach(l => {
        if (state.completedLessons.has(`${course.id}:${l.relativePath}`)) completed++;
      });
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      card.innerHTML = `
        <div class="catalog-course-banner">${course.banner || '🎓'}</div>
        <div class="catalog-course-content">
          ${course.displayId ? `<div style="font-size: 0.8rem; color: var(--brand-primary); font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(course.displayId)}</div>` : ''}
          <h2 class="catalog-course-title">${escapeHtml(course.title)}</h2>
          ${course.pathway ? `<div style="font-size: 0.7rem; background: var(--bg-primary); padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 12px; border: 1px solid var(--border-color); color: var(--text-secondary);">${escapeHtml(course.pathway.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</div>` : ''}
          <p class="catalog-course-desc">${escapeHtml(course.description || '')}</p>
          <div class="catalog-course-meta">
            <span class="catalog-meta-item">📚 ${total} lessons</span>
            <span class="catalog-meta-item">⏱️ ${course.hours ? `${escapeHtml(course.hours)} hours` : escapeHtml(course.duration || '0 min')}</span>
          </div>
          <div class="catalog-course-progress">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${percent}%"></div></div>
            <span class="progress-text">${percent}% completed</span>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        selectCourse(course);
        showPlayerView();
      });
      elements.catalogGrid.appendChild(card);
    });
  }

  function selectCourse(course, targetLessonPath = null) {
    state.currentCourse = course;
    if (elements.mobileTitle) {
      elements.mobileTitle.textContent = course.title;
    }

    renderSidebarNav(course);
    updateProgressOverview();

    // Select specific lesson or first lesson
    let lessonToLoad = null;
    if (targetLessonPath) {
      lessonToLoad = course.flatLessons.find(l => l.relativePath === targetLessonPath || l.id === targetLessonPath);
    }
    if (!lessonToLoad && course.flatLessons.length > 0) {
      lessonToLoad = course.flatLessons[0];
    }

    if (lessonToLoad) {
      loadLesson(lessonToLoad);
    } else {
      renderEmptyState('This course has no lessons yet.');
    }
  }

  // Render Sidebar Navigation Tree
  function renderSidebarNav(course, filterQuery = '') {
    elements.sidebarNav.innerHTML = '';

    if (!course || course.modules.length === 0) {
      elements.sidebarNav.innerHTML = '<div class="nav-loading">No lessons found.</div>';
      return;
    }

    const query = filterQuery.toLowerCase().trim();

    course.modules.forEach(mod => {
      const matchingLessons = mod.lessons.filter(l => {
        if (!query) return true;
        return (
          l.title.toLowerCase().includes(query) ||
          (l.description && l.description.toLowerCase().includes(query)) ||
          (l.tags && l.tags.some(t => t.toLowerCase().includes(query)))
        );
      });

      if (matchingLessons.length === 0) return;

      const moduleGroup = document.createElement('div');
      moduleGroup.className = 'module-group';

      const moduleHeader = document.createElement('div');
      moduleHeader.className = 'module-header';
      moduleHeader.innerHTML = `
        <span class="module-title">${escapeHtml(mod.title)}</span>
        <span class="module-toggle-icon">▼</span>
      `;
      moduleHeader.addEventListener('click', () => {
        moduleGroup.classList.toggle('collapsed');
      });

      const lessonsList = document.createElement('ul');
      lessonsList.className = 'module-lessons-list';

      matchingLessons.forEach(lesson => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#`;
        link.className = 'nav-lesson-link';
        link.dataset.lessonPath = lesson.relativePath;

        const isCompleted = state.completedLessons.has(getLessonKey(lesson));
        const isActive = state.currentLesson && state.currentLesson.id === lesson.id;

        if (isCompleted) link.classList.add('completed');
        if (isActive) link.classList.add('active');

        let badgeHtml = '';
        if (lesson.hasQuiz) badgeHtml += '<span class="nav-lesson-badge" title="Quiz">Quiz</span> ';
        if (lesson.video) badgeHtml += '<span class="nav-lesson-badge" title="Video">Video</span> ';
        if (lesson.hasH5P) badgeHtml += '<span class="nav-lesson-badge" title="H5P">H5P</span> ';

        link.innerHTML = `
          <span class="nav-lesson-status" aria-hidden="true"></span>
          <span class="nav-lesson-title">${escapeHtml(lesson.title)}</span>
          ${badgeHtml}
        `;

        link.addEventListener('click', (e) => {
          e.preventDefault();
          loadLesson(lesson);
          closeMobileSidebar();
        });

        li.appendChild(link);
        lessonsList.appendChild(li);
      });

      moduleGroup.appendChild(moduleHeader);
      moduleGroup.appendChild(lessonsList);
      elements.sidebarNav.appendChild(moduleGroup);
    });
  }

  function getLessonKey(lesson) {
    return `${state.currentCourse ? state.currentCourse.id : ''}:${lesson.relativePath}`;
  }

  // Load and Render Lesson Content
  async function loadLesson(lessonMeta) {
    state.currentLesson = lessonMeta;
    updateUrl(state.currentCourse.id, lessonMeta.relativePath);

    // Update active class in sidebar
    document.querySelectorAll('.nav-lesson-link').forEach(el => {
      if (el.dataset.lessonPath === lessonMeta.relativePath) {
        el.classList.add('active');
        // Ensure visible
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        el.classList.remove('active');
      }
    });

    // Loading indicator
    elements.lessonBody.innerHTML = `
      <div class="content-placeholder">
        <h3>Loading ${escapeHtml(lessonMeta.title)}...</h3>
      </div>
    `;

    try {
      const res = await fetch(`/api/lesson?course=${encodeURIComponent(state.currentCourse.id)}&path=${encodeURIComponent(lessonMeta.relativePath)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      renderLessonData(data);
    } catch (err) {
      console.error('Failed to load lesson:', err);
      elements.lessonBody.innerHTML = `
        <div class="callout callout-danger">
          <div class="callout-header">⚠️ Error Loading Lesson</div>
          <div class="callout-content">${escapeHtml(err.message)}</div>
        </div>
      `;
    }
  }

  function renderLessonData(data) {
    const { lesson, frontmatter, html, toc, stats, prev, next, course } = data;

    // Scroll to top of lesson content
    elements.lessonScrollArea.scrollTop = 0;

    // Breadcrumbs
    elements.breadcrumbs.innerHTML = `
      <span class="breadcrumb-item">${escapeHtml(course.title)}</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item">${escapeHtml(lesson.module || 'General')}</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item current">${escapeHtml(lesson.title)}</span>
    `;

    // Metadata Chips
    elements.lessonMetaChips.innerHTML = '';
    if (lesson.module) {
      elements.lessonMetaChips.innerHTML += `<span class="meta-chip chip-module">${escapeHtml(lesson.module)}</span>`;
    }
    if (frontmatter.difficulty) {
      elements.lessonMetaChips.innerHTML += `<span class="meta-chip">Level: ${escapeHtml(frontmatter.difficulty)}</span>`;
    }
    if (Array.isArray(frontmatter.tags)) {
      frontmatter.tags.forEach(t => {
        elements.lessonMetaChips.innerHTML += `<span class="meta-chip">#${escapeHtml(t)}</span>`;
      });
    }

    // Title & Description
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonDescription.textContent = frontmatter.description || lesson.description || '';

    // Stats bar
    elements.lessonStatsBar.innerHTML = `
      <span class="stat-item">🕒 ${escapeHtml(lesson.duration || `${stats.readTimeMinutes} min read`)}</span>
      <span class="stat-item">📝 ${stats.wordCount} words</span>
      <span class="stat-item">📄 ${lesson.type.toUpperCase()}</span>
    `;

    // Render HTML
    elements.lessonBody.innerHTML = html;

    // Hydrate interactive components
    hydrateInteractiveComponents(elements.lessonBody);

    // Setup Table of Contents (Right Sidebar)
    renderTableOfContents(toc);

    // Setup Completion State
    const lessonKey = getLessonKey(lesson);
    const isCompleted = state.completedLessons.has(lessonKey);
    elements.markCompletedCheckbox.checked = isCompleted;

    // Setup Next / Previous Buttons
    setupPager(prev, next);
  }

  // Setup Next / Previous Buttons at bottom
  function setupPager(prev, next) {
    if (prev) {
      elements.prevLessonBtn.disabled = false;
      elements.prevLessonTitle.textContent = prev.title;
      elements.prevLessonBtn.onclick = () => {
        const prevMeta = state.currentCourse.flatLessons.find(l => l.relativePath === prev.path);
        if (prevMeta) loadLesson(prevMeta);
      };
    } else {
      elements.prevLessonBtn.disabled = true;
      elements.prevLessonTitle.textContent = 'Beginning of course';
      elements.prevLessonBtn.onclick = null;
    }

    if (next) {
      elements.nextLessonBtn.disabled = false;
      elements.nextLessonTitle.textContent = next.title;
      elements.nextLessonBtn.onclick = () => {
        const nextMeta = state.currentCourse.flatLessons.find(l => l.relativePath === next.path);
        if (nextMeta) loadLesson(nextMeta);
      };
    } else {
      elements.nextLessonBtn.disabled = true;
      elements.nextLessonTitle.textContent = 'End of course 🎉';
      elements.nextLessonBtn.onclick = null;
    }
  }

  // Hydrate Interactive MDX & Media Components
  function hydrateInteractiveComponents(container) {
    // 1. Quizzes
    container.querySelectorAll('.quiz-component').forEach(quizEl => {
      const answerIndex = parseInt(quizEl.dataset.answer, 10);
      const submitBtn = quizEl.querySelector('.quiz-submit-btn');
      const retryBtn = quizEl.querySelector('.quiz-retry-btn');
      const feedbackEl = quizEl.querySelector('.quiz-feedback');
      const statusEl = quizEl.querySelector('.quiz-feedback-status');
      const options = quizEl.querySelectorAll('.quiz-option');

      let selectedIndex = null;

      options.forEach(opt => {
        opt.addEventListener('click', () => {
          if (quizEl.classList.contains('answered-correct')) return;

          options.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          selectedIndex = parseInt(opt.dataset.index, 10);
          submitBtn.disabled = false;
        });
      });

      submitBtn.addEventListener('click', () => {
        if (selectedIndex === null) return;

        submitBtn.style.display = 'none';
        feedbackEl.style.display = 'block';

        if (selectedIndex === answerIndex) {
          quizEl.classList.add('answered-correct');
          quizEl.classList.remove('answered-incorrect');
          feedbackEl.className = 'quiz-feedback status-correct';
          statusEl.textContent = '🎉 Correct! Well done.';

          triggerConfetti();

          // Auto-mark lesson as completed if it's the only quiz or test
          options[selectedIndex].classList.add('correct');
        } else {
          quizEl.classList.add('answered-incorrect');
          feedbackEl.className = 'quiz-feedback status-incorrect';
          statusEl.textContent = '❌ Not quite. Review the explanation below and try again!';

          options[selectedIndex].classList.add('selected');
          options[answerIndex].classList.add('correct');

          retryBtn.style.display = 'inline-block';
        }
      });

      retryBtn.addEventListener('click', () => {
        quizEl.classList.remove('answered-incorrect', 'answered-correct');
        options.forEach(o => {
          o.classList.remove('selected', 'correct');
        });
        selectedIndex = null;
        submitBtn.style.display = 'inline-block';
        submitBtn.disabled = true;
        retryBtn.style.display = 'none';
        feedbackEl.style.display = 'none';
      });
    });

    // 2. Single Flashcards
    container.querySelectorAll('.flashcard-container .flashcard').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });

    // 3. Flashcard Decks
    container.querySelectorAll('.flashcard-deck-component').forEach(deckEl => {
      let cards = [];
      try {
        cards = JSON.parse(deckEl.dataset.cards || '[]');
      } catch {}

      if (cards.length === 0) return;

      let currentIndex = 0;
      const card = deckEl.querySelector('.flashcard');
      const counterEl = deckEl.querySelector('.deck-current-num');
      const frontContent = deckEl.querySelector('.deck-front-content');
      const backContent = deckEl.querySelector('.deck-back-content');
      const hintContent = deckEl.querySelector('.deck-hint-content');
      const prevBtn = deckEl.querySelector('.deck-prev-btn');
      const nextBtn = deckEl.querySelector('.deck-next-btn');
      const flipBtn = deckEl.querySelector('.deck-flip-btn');

      function updateCardView() {
        card.classList.remove('flipped');
        const c = cards[currentIndex];
        counterEl.textContent = (currentIndex + 1).toString();
        frontContent.textContent = c.front || '';
        backContent.textContent = c.back || '';

        if (c.hint) {
          hintContent.textContent = `💡 Hint: ${c.hint}`;
          hintContent.style.display = 'block';
        } else {
          hintContent.style.display = 'none';
        }

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === cards.length - 1;
      }

      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });

      flipBtn.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });

      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCardView();
        }
      });

      nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
          currentIndex++;
          updateCardView();
        }
      });

      updateCardView();
    });

    // 4. HTML5 Video Player Speed Controls
    container.querySelectorAll('.course-video-wrapper.direct-video').forEach(wrapper => {
      const video = wrapper.querySelector('video');
      const speedBtns = wrapper.querySelectorAll('.speed-btn');

      speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          speedBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const speed = parseFloat(btn.dataset.speed);
          if (video && !isNaN(speed)) {
            video.playbackRate = speed;
          }
        });
      });
    });

    // 5. H5P Fullscreen Toggle
    container.querySelectorAll('.h5p-wrapper').forEach(h5pEl => {
      const fsBtn = h5pEl.querySelector('.h5p-fullscreen-btn');
      const iframe = h5pEl.querySelector('iframe');
      if (fsBtn && iframe) {
        fsBtn.addEventListener('click', () => {
          if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
          } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
          }
        });
      }
    });

    // 6. Tabs
    container.querySelectorAll('.tabs-container').forEach(tabsEl => {
      const tabBtns = tabsEl.querySelectorAll('.tab-btn');
      const tabPanels = tabsEl.querySelectorAll('.tab-panel');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          tabPanels.forEach(p => p.classList.remove('active'));

          btn.classList.add('active');
          const targetId = btn.dataset.target;
          const targetPanel = tabsEl.querySelector(`#${targetId}`);
          if (targetPanel) targetPanel.classList.add('active');
        });
      });
    });
  }

  // Render Table of Contents (Right Sidebar)
  function renderTableOfContents(toc) {
    elements.tocNav.innerHTML = '';

    if (!toc || toc.length === 0) {
      elements.tocNav.innerHTML = '<span class="toc-empty">No subheadings</span>';
      return;
    }

    toc.forEach(item => {
      const a = document.createElement('a');
      a.href = `#${item.id}`;
      a.className = `toc-link level-${item.level}`;
      a.textContent = item.text;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(item.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', `#${item.id}`);
        }
      });

      elements.tocNav.appendChild(a);
    });

    setupScrollSpy();
  }

  // ScrollSpy for TOC links
  function setupScrollSpy() {
    const headings = elements.lessonBody.querySelectorAll('h2[id], h3[id], h4[id]');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll('.toc-link').forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: elements.lessonScrollArea,
      rootMargin: '0px 0px -70% 0px',
      threshold: 0.1
    });

    headings.forEach(h => observer.observe(h));
  }

  // Update Progress Bar
  function updateProgressOverview() {
    if (!state.currentCourse || state.currentCourse.flatLessons.length === 0) {
      elements.progressBarFill.style.width = '0%';
      elements.progressPercent.textContent = '0%';
      elements.progressCount.textContent = '0 of 0 completed';
      return;
    }

    const total = state.currentCourse.flatLessons.length;
    let completed = 0;

    state.currentCourse.flatLessons.forEach(l => {
      if (state.completedLessons.has(getLessonKey(l))) {
        completed++;
      }
    });

    const percent = Math.round((completed / total) * 100);
    elements.progressBarFill.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressCount.textContent = `${completed} of ${total} completed`;
  }

  // Toggle Lesson Completion
  function toggleLessonCompleted() {
    if (!state.currentLesson) return;

    const key = getLessonKey(state.currentLesson);
    const isCompleted = elements.markCompletedCheckbox.checked;

    if (isCompleted) {
      state.completedLessons.add(key);
      triggerConfetti();
    } else {
      state.completedLessons.delete(key);
    }

    saveCompletedLessons();
    updateProgressOverview();

    // Update checkmark in sidebar
    document.querySelectorAll('.nav-lesson-link').forEach(link => {
      if (link.dataset.lessonPath === state.currentLesson.relativePath) {
        if (isCompleted) link.classList.add('completed');
        else link.classList.remove('completed');
      }
    });
  }

  // Setup Event Listeners
  function setupEventListeners() {
    if (elements.backToCatalogBtn) {
      elements.backToCatalogBtn.addEventListener('click', showCatalogView);
    }

    // Mark Completed checkbox
    elements.markCompletedCheckbox.addEventListener('change', toggleLessonCompleted);

    // Theme toggles
    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    elements.mobileThemeToggle.addEventListener('click', toggleTheme);
    if (elements.catalogThemeToggle) {
      elements.catalogThemeToggle.addEventListener('click', toggleTheme);
    }

    // Font size controls
    elements.fontIncreaseBtn.addEventListener('click', () => applyFontSize(state.fontSize + 1));
    elements.fontDecreaseBtn.addEventListener('click', () => applyFontSize(state.fontSize - 1));
    elements.fontResetBtn.addEventListener('click', () => applyFontSize(16));

    // TOC toggle for small screens
    elements.tocToggleBtn.addEventListener('click', () => {
      const current = window.getComputedStyle(elements.tocSidebar).display;
      elements.tocSidebar.style.display = current === 'none' ? 'flex' : 'none';
    });

    // Mobile sidebar toggle
    elements.mobileSidebarToggle.addEventListener('click', () => {
      elements.sidebar.classList.toggle('open');
    });

    elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    // Sidebar search input
    elements.lessonSearchInput.addEventListener('input', (e) => {
      renderSidebarNav(state.currentCourse, e.target.value);
    });

    // Folder Modal
    if (elements.catalogChangeFolderBtn) {
      elements.catalogChangeFolderBtn.addEventListener('click', () => {
        elements.folderModal.style.display = 'flex';
        elements.modalStatusMsg.textContent = '';
      });
    }

    elements.closeFolderModal.addEventListener('click', () => {
      elements.folderModal.style.display = 'none';
    });

    elements.folderModal.addEventListener('click', (e) => {
      if (e.target === elements.folderModal) elements.folderModal.style.display = 'none';
    });

    // Folder Path form submit
    elements.folderPathForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const path = elements.folderPathInput.value.trim();
      if (!path) return;

      elements.modalStatusMsg.className = 'modal-status';
      elements.modalStatusMsg.textContent = 'Scanning directory...';

      try {
        const res = await fetch('/api/directory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dir: path })
        });
        const result = await res.json();
        if (result.success) {
          elements.modalStatusMsg.className = 'modal-status success';
          elements.modalStatusMsg.textContent = `Success! Discovered ${result.coursesCount} course(s).`;
          setTimeout(() => {
            elements.folderModal.style.display = 'none';
            loadInitialData();
          }, 600);
        } else {
          elements.modalStatusMsg.className = 'modal-status error';
          elements.modalStatusMsg.textContent = `Error: ${result.error}`;
        }
      } catch (err) {
        elements.modalStatusMsg.className = 'modal-status error';
        elements.modalStatusMsg.textContent = `Error: ${err.message}`;
      }
    });

    // In-browser folder picker (webkitdirectory)
    elements.localFolderPicker.addEventListener('change', handleLocalFolderSelection);

    // Global Search Modal (Cmd+K)
    window.addEventListener('keydown', handleGlobalKeydown);
    elements.searchModal.addEventListener('click', (e) => {
      if (e.target === elements.searchModal) elements.searchModal.style.display = 'none';
    });
    elements.modalSearchInput.addEventListener('input', handleModalSearch);
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove('open');
  }

  // Keyboard navigation & shortcuts
  function handleGlobalKeydown(e) {
    // Cmd+K or Ctrl+K or /
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
      return;
    }

    if (e.key === 'Escape') {
      elements.folderModal.style.display = 'none';
      elements.searchModal.style.display = 'none';
      return;
    }

    // Alt + Right -> Next lesson
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      if (elements.nextLessonBtn && !elements.nextLessonBtn.disabled) {
        elements.nextLessonBtn.click();
      }
    }

    // Alt + Left -> Previous lesson
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      if (elements.prevLessonBtn && !elements.prevLessonBtn.disabled) {
        elements.prevLessonBtn.click();
      }
    }
  }

  function openSearchModal() {
    elements.searchModal.style.display = 'flex';
    elements.modalSearchInput.value = '';
    elements.modalSearchInput.focus();
    handleModalSearch({ target: { value: '' } });
  }

  function handleModalSearch(e) {
    const q = (e.target.value || '').toLowerCase().trim();
    if (!q) {
      elements.searchModalResults.innerHTML = '<div class="search-empty-state">Type a query to search across all courses and lessons...</div>';
      return;
    }

    const matches = [];
    state.courses.forEach(course => {
      course.flatLessons.forEach(lesson => {
        if (
          lesson.title.toLowerCase().includes(q) ||
          (lesson.description && lesson.description.toLowerCase().includes(q)) ||
          (lesson.module && lesson.module.toLowerCase().includes(q)) ||
          (lesson.tags && lesson.tags.some(t => t.toLowerCase().includes(q)))
        ) {
          matches.push({ course, lesson });
        }
      });
    });

    if (matches.length === 0) {
      elements.searchModalResults.innerHTML = `<div class="search-empty-state">No matching lessons found for "${escapeHtml(q)}"</div>`;
      return;
    }

    elements.searchModalResults.innerHTML = '';
    matches.slice(0, 10).forEach(({ course, lesson }) => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <span class="search-result-title">${escapeHtml(lesson.title)}</span>
        <span class="search-result-meta">${escapeHtml(course.title)} &bull; ${escapeHtml(lesson.module || 'General')}</span>
      `;
      item.addEventListener('click', () => {
        elements.searchModal.style.display = 'none';
        if (state.currentCourse.id !== course.id) {
          selectCourse(course, lesson.relativePath);
        } else {
          loadLesson(lesson);
        }
      });
      elements.searchModalResults.appendChild(item);
    });
  }

  // HTML5 In-Browser Folder Picker support
  async function handleLocalFolderSelection(e) {
    const files = Array.from(e.target.files);
    const mdFiles = files.filter(f => f.name.endsWith('.md') || f.name.endsWith('.mdx'));

    if (mdFiles.length === 0) {
      elements.modalStatusMsg.className = 'modal-status error';
      elements.modalStatusMsg.textContent = 'No markdown (.md, .mdx) files found in selected folder.';
      return;
    }

    elements.modalStatusMsg.className = 'modal-status success';
    elements.modalStatusMsg.textContent = `Found ${mdFiles.length} markdown file(s). Uploading/configuring...`;

    // Try posting the folder's parent path or fallback to local parsing
    // In webkitRelativePath, first segment is folder name
    const folderName = mdFiles[0].webkitRelativePath.split('/')[0] || 'Selected Folder';
    elements.footerFolderName.textContent = `Folder: ${folderName}`;
    elements.folderModal.style.display = 'none';
  }

  // SSE Hot Reload
  function setupHotReload() {
    try {
      const eventSource = new EventSource('/api/events');
      eventSource.onmessage = async (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'content-change') {
            console.log('[LiveReload] Content changed:', data.file);
            // Refresh courses tree and reload current lesson
            const res = await fetch('/api/courses');
            if (res.ok) {
              const resData = await res.json();
              state.courses = resData.courses;
              const activeCourse = state.courses.find(c => c.id === state.currentCourse.id) || state.courses[0];
              state.currentCourse = activeCourse;
              renderSidebarNav(activeCourse);
              updateProgressOverview();

              if (state.currentLesson) {
                const updatedLesson = activeCourse.flatLessons.find(l => l.relativePath === state.currentLesson.relativePath);
                if (updatedLesson) loadLesson(updatedLesson);
              }
            }
          }
        } catch {}
      };
    } catch {}
  }

  // Confetti Particle System
  function triggerConfetti() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotationSpeed;
        p.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frame++;
      if (frame < 80) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(animate);
  }

  // Copy Code Snippet Helper
  window.copyCodeSnippet = function (btn) {
    const pre = btn.closest('.code-block-wrapper').querySelector('pre code');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.classList.add('copied');
      const text = btn.querySelector('.copy-text');
      if (text) text.textContent = 'Copied! ✓';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (text) text.textContent = 'Copy';
      }, 2000);
    });
  };

  function updateUrl(courseId, lessonPath) {
    const url = new URL(window.location);
    url.searchParams.set('course', courseId);
    url.searchParams.set('lesson', lessonPath);
    window.history.replaceState({}, '', url);
  }

  function renderEmptyState(msg) {
    elements.lessonBody.innerHTML = `
      <div class="content-placeholder">
        <h3>Course Player</h3>
        <p>${escapeHtml(msg)}</p>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run!
  document.addEventListener('DOMContentLoaded', init);
})();
