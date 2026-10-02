/**
 * MDX Interactive Components Parser & Renderer
 * Parses and renders educational interactive components:
 * - <Quiz ... />
 * - <Flashcard ... />
 * - <FlashcardDeck ... />
 * - <H5P ... />
 * - <Callout ... />
 * - <Tabs ... />
 * - <Video ... />
 */

import { parseVideoUrl, renderVideoPlayer } from './video-helper.js';

let componentIdCounter = 0;
export function resetComponentCounter() {
  componentIdCounter = 0;
}

export function parseJsxAttributes(attrString) {
  const attrs = {};
  if (!attrString) return attrs;

  let i = 0;
  const len = attrString.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(attrString[i])) i++;
    if (i >= len) break;

    // Read key name
    const keyStart = i;
    while (i < len && /[a-zA-Z0-9_-]/.test(attrString[i])) i++;
    const key = attrString.slice(keyStart, i);
    if (!key) {
      i++;
      continue;
    }

    // Skip whitespace between key and '='
    while (i < len && /\s/.test(attrString[i])) i++;

    if (i < len && attrString[i] === '=') {
      i++; // skip '='
      while (i < len && /\s/.test(attrString[i])) i++;

      if (i < len && attrString[i] === '{') {
        // Balanced braces scanner
        i++; // skip '{'
        let depth = 1;
        const valStart = i;
        let inString = false;
        let quoteChar = '';

        while (i < len && depth > 0) {
          const char = attrString[i];
          if (inString) {
            if (char === quoteChar && attrString[i - 1] !== '\\') {
              inString = false;
            }
          } else {
            if (char === '"' || char === "'") {
              inString = true;
              quoteChar = char;
            } else if (char === '{') {
              depth++;
            } else if (char === '}') {
              depth--;
            }
          }
          i++;
        }

        const rawExpr = attrString.slice(valStart, i - (depth === 0 ? 1 : 0)).trim();
        attrs[key] = evaluateJsxExpression(rawExpr);
      } else if (i < len && (attrString[i] === '"' || attrString[i] === "'")) {
        // Quoted string
        const quote = attrString[i++];
        const valStart = i;
        while (i < len && attrString[i] !== quote) {
          if (attrString[i] === '\\') i++; // escape next
          i++;
        }
        attrs[key] = attrString.slice(valStart, i);
        if (i < len && attrString[i] === quote) i++;
      } else {
        // Unquoted value
        const valStart = i;
        while (i < len && !/\s/.test(attrString[i])) i++;
        attrs[key] = evaluateJsxExpression(attrString.slice(valStart, i));
      }
    } else {
      // Boolean prop: <Component flag />
      attrs[key] = true;
    }
  }

  return attrs;
}

function evaluateJsxExpression(expr) {
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (!isNaN(expr) && expr !== '') return Number(expr);

  // Try parsing as JSON (arrays [1, 2] or objects { a: 1 })
  try {
    // Convert single quotes in JS arrays to double quotes for valid JSON
    const sanitized = expr
      .replace(/'/g, '"')
      .replace(/([a-zA-Z0-9_]+):/g, '"$1":'); // Quote unquoted keys
    return JSON.parse(sanitized);
  } catch {
    // If JSON parse fails, return raw string or array split
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    }
    return expr;
  }
}

/**
 * Render Quiz Component
 */
export function renderQuiz(attrs, innerContent = '') {
  const id = `quiz-${++componentIdCounter}`;
  const question = attrs.question || attrs.title || 'Knowledge Check';
  let options = attrs.options || [];
  let answerIndex = attrs.answer !== undefined ? Number(attrs.answer) : (attrs.correct !== undefined ? Number(attrs.correct) : 0);
  const explanation = attrs.explanation || '';

  // If options were not passed as prop, check if inner content has <Option> tags
  if ((!options || options.length === 0) && innerContent) {
    const optionMatches = [...innerContent.matchAll(/<Option(?:\s+correct)?>(.*?)<\/Option>/gis)];
    if (optionMatches.length > 0) {
      options = optionMatches.map((m, idx) => {
        if (m[0].includes('correct')) answerIndex = idx;
        return m[1].trim();
      });
    }
  }

  const optionsJson = JSON.stringify(options).replace(/"/g, '&quot;');
  const explanationAttr = (explanation || '').replace(/"/g, '&quot;');

  const optionsHtml = options.map((opt, idx) => `
    <label class="quiz-option" data-index="${idx}">
      <input type="radio" name="${id}-options" value="${idx}" class="quiz-radio">
      <span class="quiz-radio-custom"></span>
      <span class="quiz-option-text">${escapeHtml(opt)}</span>
    </label>
  `).join('');

  return `
<div class="interactive-component quiz-component" id="${id}" data-answer="${answerIndex}" data-explanation="${explanationAttr}" data-total="${options.length}">
  <div class="quiz-header">
    <span class="quiz-badge">🧠 KNOWLEDGE CHECK</span>
    <h4 class="quiz-question">${escapeHtml(question)}</h4>
  </div>
  <div class="quiz-body">
    <div class="quiz-options-list">
      ${optionsHtml}
    </div>
  </div>
  <div class="quiz-footer">
    <div class="quiz-actions">
      <button type="button" class="btn btn-primary quiz-submit-btn" disabled>Check Answer</button>
      <button type="button" class="btn btn-secondary quiz-retry-btn" style="display: none;">Try Again</button>
    </div>
    <div class="quiz-feedback" style="display: none;">
      <div class="quiz-feedback-status"></div>
      <div class="quiz-feedback-explanation">${escapeHtml(explanation)}</div>
    </div>
  </div>
</div>`.trim();
}

/**
 * Render Flashcard Component (Single or Deck)
 */
export function renderFlashcard(attrs, innerContent = '') {
  const id = `flashcard-${++componentIdCounter}`;
  const front = attrs.front || attrs.q || 'Question';
  const back = attrs.back || attrs.a || innerContent || 'Answer';
  const hint = attrs.hint || '';

  return `
<div class="interactive-component flashcard-container" id="${id}">
  <div class="flashcard" tabindex="0" role="button" aria-label="Interactive flashcard. Click to flip.">
    <div class="flashcard-inner">
      <div class="flashcard-front">
        <div class="flashcard-badge">PROMPT</div>
        <div class="flashcard-content">${escapeHtml(front)}</div>
        ${hint ? `<div class="flashcard-hint-text">💡 Hint: ${escapeHtml(hint)}</div>` : ''}
        <div class="flashcard-flip-prompt">Click to flip ↷</div>
      </div>
      <div class="flashcard-back">
        <div class="flashcard-badge">ANSWER</div>
        <div class="flashcard-content">${escapeHtml(back)}</div>
        <div class="flashcard-flip-prompt">Click to flip back ↶</div>
      </div>
    </div>
  </div>
</div>`.trim();
}

/**
 * Render Flashcard Deck Component
 */
export function renderFlashcardDeck(attrs) {
  const id = `flashcard-deck-${++componentIdCounter}`;
  const title = attrs.title || 'Flashcard Deck';
  const cards = Array.isArray(attrs.cards) ? attrs.cards : [];
  const cardsJson = JSON.stringify(cards).replace(/"/g, '&quot;');

  if (cards.length === 0) {
    return `<div class="flashcard-deck-empty">No flashcards in deck</div>`;
  }

  const firstCard = cards[0];

  return `
<div class="interactive-component flashcard-deck-component" id="${id}" data-cards="${cardsJson}" data-current="0" data-total="${cards.length}">
  <div class="deck-header">
    <div class="deck-title-group">
      <span class="deck-icon">🗂️</span>
      <h4 class="deck-title">${escapeHtml(title)}</h4>
    </div>
    <div class="deck-counter">Card <span class="deck-current-num">1</span> of ${cards.length}</div>
  </div>
  <div class="deck-card-wrapper">
    <div class="flashcard" tabindex="0" role="button" aria-label="Flashcard in deck. Click to flip.">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-badge">PROMPT</div>
          <div class="flashcard-content deck-front-content">${escapeHtml(firstCard.front || '')}</div>
          ${firstCard.hint ? `<div class="flashcard-hint-text deck-hint-content">💡 Hint: ${escapeHtml(firstCard.hint)}</div>` : '<div class="flashcard-hint-text deck-hint-content" style="display:none;"></div>'}
          <div class="flashcard-flip-prompt">Click to reveal answer ↷</div>
        </div>
        <div class="flashcard-back">
          <div class="flashcard-badge">ANSWER</div>
          <div class="flashcard-content deck-back-content">${escapeHtml(firstCard.back || '')}</div>
          <div class="flashcard-flip-prompt">Click to flip back ↶</div>
        </div>
      </div>
    </div>
  </div>
  <div class="deck-navigation">
    <button type="button" class="btn btn-secondary deck-prev-btn" disabled>← Previous</button>
    <button type="button" class="btn btn-secondary deck-flip-btn">Flip Card</button>
    <button type="button" class="btn btn-primary deck-next-btn">Next →</button>
  </div>
</div>`.trim();
}

/**
 * Render H5P Content Embed
 */
export function renderH5P(attrs) {
  const id = `h5p-${++componentIdCounter}`;
  const src = attrs.src || attrs.url || '';
  const title = attrs.title || 'H5P Interactive Content';
  const height = attrs.height || '450px';

  if (!src) {
    return `<div class="h5p-error-box">H5P Embed Error: Missing 'src' parameter</div>`;
  }

  return `
<div class="interactive-component h5p-wrapper" id="${id}">
  <div class="h5p-header">
    <div class="h5p-title-info">
      <span class="h5p-logo-badge">H5P</span>
      <span class="h5p-title">${escapeHtml(title)}</span>
    </div>
    <div class="h5p-actions">
      <a href="${escapeHtml(src)}" target="_blank" rel="noopener" class="h5p-open-external" title="Open in new window">
        External ↗
      </a>
      <button type="button" class="h5p-fullscreen-btn" title="Fullscreen">⛶</button>
    </div>
  </div>
  <div class="h5p-iframe-container" style="min-height: ${escapeHtml(height)};">
    <iframe
      src="${escapeHtml(src)}"
      class="h5p-iframe"
      frameborder="0"
      allow="fullscreen; geolocation; microphone; camera"
      loading="lazy"
      title="${escapeHtml(title)}">
    </iframe>
  </div>
</div>`.trim();
}

/**
 * Render Callout
 */
export function renderCallout(attrs, innerContent = '') {
  const type = (attrs.type || 'note').toLowerCase();
  const title = attrs.title || capitalize(type);
  const iconMap = {
    note: '📝',
    tip: '💡',
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🛑',
    success: '✅'
  };
  const icon = attrs.icon || iconMap[type] || '📌';

  return `
<div class="callout callout-${escapeHtml(type)}">
  <div class="callout-header">
    <span class="callout-icon">${icon}</span>
    <span class="callout-title">${escapeHtml(title)}</span>
  </div>
  <div class="callout-content">${innerContent}</div>
</div>`.trim();
}

/**
 * Render Tabs Component
 */
export function renderTabs(innerContent = '') {
  const id = `tabs-${++componentIdCounter}`;
  // Extract individual <Tab label="...">...</Tab>
  const tabMatches = [...innerContent.matchAll(/<Tab\s+label=["']([^"']+)["']\s*>(.*?)<\/Tab>/gis)];

  if (tabMatches.length === 0) {
    return `<div class="tabs-container">${innerContent}</div>`;
  }

  const tabButtons = tabMatches.map((m, idx) => `
    <button type="button" class="tab-btn ${idx === 0 ? 'active' : ''}" data-target="${id}-panel-${idx}">
      ${escapeHtml(m[1])}
    </button>
  `).join('');

  const tabPanels = tabMatches.map((m, idx) => `
    <div class="tab-panel ${idx === 0 ? 'active' : ''}" id="${id}-panel-${idx}">
      ${m[2]}
    </div>
  `).join('');

  return `
<div class="tabs-container" id="${id}">
  <div class="tabs-header-bar">${tabButtons}</div>
  <div class="tabs-content-body">${tabPanels}</div>
</div>`.trim();
}

/**
 * Render Video Component (MDX tag: <Video src="..." title="..." />)
 */
export function renderMdxVideo(attrs) {
  const src = attrs.src || attrs.url || '';
  const title = attrs.title || attrs.caption || 'Course Video';
  const videoInfo = parseVideoUrl(src);
  if (!videoInfo) {
    return `<div class="video-error">Invalid or unsupported video URL: ${escapeHtml(src)}</div>`;
  }
  return renderVideoPlayer(videoInfo, title);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
