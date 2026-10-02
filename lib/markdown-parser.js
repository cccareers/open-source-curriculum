/**
 * Full Markdown & MDX Parser
 * Zero-dependency, lightweight, secure, and extensible.
 * Supports:
 * - Frontmatter extraction
 * - Headings with anchor IDs for Table of Contents
 * - Video links auto-detection (YouTube, Vimeo, MP4, Loom)
 * - MDX Interactive Components (<Quiz />, <Flashcard />, <FlashcardDeck />, <H5P />, <Callout />, <Tabs />, <Video />)
 * - GitHub Flavored Markdown (tables, task lists, code blocks, blockquotes)
 */

import { parseFrontmatter } from './frontmatter.js';
import { parseVideoUrl, renderVideoPlayer } from './video-helper.js';
import {
  parseJsxAttributes,
  renderQuiz,
  renderFlashcard,
  renderFlashcardDeck,
  renderH5P,
  renderCallout,
  renderTabs,
  renderMdxVideo,
  resetComponentCounter
} from './mdx-components.js';

/**
 * Robust scanner for JSX elements in MDX.
 * Correctly accounts for quotes, nested braces, and self-closing tags.
 */
function replaceMdxComponent(text, tagName, renderFn) {
  const openPattern = new RegExp(`<${tagName}(?=[\\s/>])`, 'gi');
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = openPattern.exec(text)) !== null) {
    result += text.slice(lastIndex, match.index);
    let i = match.index + match[0].length;
    const len = text.length;

    let inQuote = false;
    let quoteChar = '';
    let braceDepth = 0;
    let isSelfClosing = false;
    const attrStart = i;

    while (i < len) {
      const ch = text[i];
      if (inQuote) {
        if (ch === quoteChar && text[i - 1] !== '\\') inQuote = false;
      } else if (ch === '"' || ch === "'") {
        inQuote = true;
        quoteChar = ch;
      } else if (ch === '{') {
        braceDepth++;
      } else if (ch === '}') {
        if (braceDepth > 0) braceDepth--;
      } else if (braceDepth === 0) {
        if (ch === '/' && text[i + 1] === '>') {
          isSelfClosing = true;
          break;
        } else if (ch === '>') {
          break;
        }
      }
      i++;
    }

    if (i >= len) {
      result += text.slice(match.index);
      lastIndex = len;
      break;
    }

    const attrStr = text.slice(attrStart, i).trim();
    if (isSelfClosing) {
      i += 2; // skip '/>'
      result += renderFn(attrStr, '');
      lastIndex = i;
      openPattern.lastIndex = i;
    } else {
      i += 1; // skip '>'
      const contentStart = i;
      const closeTag = `</${tagName}>`;
      const closeIdx = text.toLowerCase().indexOf(closeTag.toLowerCase(), i);
      if (closeIdx === -1) {
        result += renderFn(attrStr, '');
        lastIndex = i;
        openPattern.lastIndex = i;
      } else {
        const innerContent = text.slice(contentStart, closeIdx);
        i = closeIdx + closeTag.length;
        result += renderFn(attrStr, innerContent);
        lastIndex = i;
        openPattern.lastIndex = i;
      }
    }
  }

  result += text.slice(lastIndex);
  return result;
}

export function parseMarkdown(rawContent, options = {}) {
  resetComponentCounter();

  // 1. Extract frontmatter
  const { data: frontmatter, content: rawBody } = parseFrontmatter(rawContent);

  const toc = [];
  const slugCounts = new Map();

  function makeSlug(text) {
    let slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    if (!slug) slug = 'section';
    if (slugCounts.has(slug)) {
      const count = slugCounts.get(slug) + 1;
      slugCounts.set(slug, count);
      return `${slug}-${count}`;
    } else {
      slugCounts.set(slug, 0);
      return slug;
    }
  }

  // Calculate read time
  const wordCount = rawBody.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  let processed = rawBody;

  // 2. Pre-process MDX interactive components before markdown transforms
  // Store placeholders to prevent markdown parser from corrupting JSX tags
  const placeholders = [];
  function savePlaceholder(html) {
    const key = `<!--MDX_PLACEHOLDER_${placeholders.length}-->`;
    placeholders.push(html);
    return key;
  }

  // A. Frontmatter video banner if present
  if (frontmatter.video) {
    const fVideo = parseVideoUrl(frontmatter.video);
    if (fVideo) {
      const videoHtml = renderVideoPlayer(fVideo, frontmatter.title ? `Featured: ${frontmatter.title}` : 'Lesson Video');
      processed = `${savePlaceholder(videoHtml)}\n\n${processed}`;
    }
  }

  // B. MDX Components using robust JSX tag scanner
  processed = replaceMdxComponent(processed, 'Quiz', (attrsStr, inner) => {
    const attrs = parseJsxAttributes(attrsStr);
    return savePlaceholder(renderQuiz(attrs, inner));
  });

  processed = replaceMdxComponent(processed, 'FlashcardDeck', (attrsStr) => {
    const attrs = parseJsxAttributes(attrsStr);
    return savePlaceholder(renderFlashcardDeck(attrs));
  });

  processed = replaceMdxComponent(processed, 'Flashcard', (attrsStr, inner) => {
    const attrs = parseJsxAttributes(attrsStr);
    return savePlaceholder(renderFlashcard(attrs, inner));
  });

  processed = replaceMdxComponent(processed, 'H5P', (attrsStr) => {
    const attrs = parseJsxAttributes(attrsStr);
    return savePlaceholder(renderH5P(attrs));
  });

  processed = replaceMdxComponent(processed, 'Callout', (attrsStr, inner) => {
    const attrs = parseJsxAttributes(attrsStr);
    return savePlaceholder(renderCallout(attrs, inner));
  });

  processed = replaceMdxComponent(processed, 'Tabs', (_, inner) => {
    return savePlaceholder(renderTabs(inner));
  });

  processed = replaceMdxComponent(processed, 'Video', (attrsStr) => {
    const attrs = parseJsxAttributes(attrsStr);
    return savePlaceholder(renderMdxVideo(attrs));
  });

  // 3. Fenced Code Blocks (```lang ... ```)
  processed = processed.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const cleanLang = (lang || 'text').toLowerCase();
    const escapedCode = escapeHtml(code.trimEnd());
    const codeBlockHtml = `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-lang-label">${escapeHtml(cleanLang)}</span>
    <button type="button" class="copy-code-btn" title="Copy code" onclick="copyCodeSnippet(this)">
      <span class="copy-icon">📋</span>
      <span class="copy-text">Copy</span>
    </button>
  </div>
  <pre class="language-${escapeHtml(cleanLang)}"><code class="language-${escapeHtml(cleanLang)}">${escapedCode}</code></pre>
</div>`.trim();
    return savePlaceholder(codeBlockHtml);
  });

  // 4. Standalone Video Links Detection
  // Matches standalone lines with YouTube/Vimeo/MP4 URLs:
  // e.g. "https://www.youtube.com/watch?v=123"
  // or markdown video links: ![video](url) or [video](url)
  processed = processed.replace(
    /^(?:!\[(.*?)\]\((https?:\/\/[^\s)]+)\)|\[(.*?)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+))$/gim,
    (fullLine, imgAlt, imgUrl, linkText, linkUrl, bareUrl) => {
      const targetUrl = imgUrl || linkUrl || bareUrl;
      const targetTitle = imgAlt || (linkText && linkText.toLowerCase() !== 'video' ? linkText : '');

      const videoInfo = parseVideoUrl(targetUrl);
      if (videoInfo) {
        return savePlaceholder(renderVideoPlayer(videoInfo, targetTitle));
      }
      return fullLine;
    }
  );

  // 5. GitHub Alert Blockquotes (> [!NOTE], > [!TIP], etc.)
  processed = processed.replace(
    /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s+(.*?))?\r?\n((?:>.*(?:\r?\n|$))*)/gim,
    (_, type, alertTitle, body) => {
      const cleanBody = body.replace(/^>\s?/gm, '').trim();
      const alertType = type.toLowerCase();
      const calloutAttrs = {
        type: alertType === 'note' ? 'info' : (alertType === 'caution' ? 'danger' : alertType),
        title: alertTitle || type
      };
      return savePlaceholder(renderCallout(calloutAttrs, cleanBody));
    }
  );

  // 6. Regular Blockquotes
  processed = processed.replace(
    /^(?:>.*(?:\r?\n|$))+/gm,
    (block) => {
      const inner = block.replace(/^>\s?/gm, '').trim();
      return `<blockquote><p>${inner.replace(/\n\n+/g, '</p><p>')}</p></blockquote>\n\n`;
    }
  );

  // 7. Markdown Tables
  processed = processed.replace(
    /((?:^\|.+?\|(?:\r?\n|$)){2,})/gm,
    (tableMatch) => {
      return renderTable(tableMatch);
    }
  );

  // 8. Headings (#, ##, ###, ####, #####, ######)
  processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    const cleanText = text.trim();
    const slug = makeSlug(cleanText);

    // Save to TOC if h2 or h3
    if (level >= 2 && level <= 4) {
      toc.push({ level, text: cleanText, id: slug });
    }

    return `<h${level} id="${slug}" class="heading-anchor-group">
      <a href="#${slug}" class="heading-anchor" aria-hidden="true">#</a>
      <span>${parseInlineFormatting(cleanText)}</span>
    </h${level}>`;
  });

  // 9. Horizontal Rules (---, ***, ___)
  processed = processed.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="content-divider" />');

  // 10. Task Lists & Lists
  // - [ ] Task or - [x] Done
  processed = processed.replace(
    /^(\s*)[-*+]\s+\[([ xX])\]\s+(.+)$/gm,
    (_, indent, checked, label) => {
      const isChecked = checked.toLowerCase() === 'x';
      return `${indent}<li class="task-list-item"><input type="checkbox" ${isChecked ? 'checked' : ''} disabled class="task-checkbox"> <span>${parseInlineFormatting(label)}</span></li>`;
    }
  );

  // Regular Unordered lists (- or * or +)
  processed = processed.replace(/(?:^[-*+]\s+(?:(?!<li).)+$\r?\n?)+/gm, (listBlock) => {
    const items = listBlock.trim().split(/\r?\n/).map(line => {
      const itemText = line.replace(/^[-*+]\s+/, '');
      return `<li>${parseInlineFormatting(itemText)}</li>`;
    }).join('\n');
    return `<ul>\n${items}\n</ul>\n\n`;
  });

  // Regular Ordered lists (1. 2. 3.)
  processed = processed.replace(/(?:^\d+\.\s+.+$\r?\n?)+/gm, (listBlock) => {
    const items = listBlock.trim().split(/\r?\n/).map(line => {
      const itemText = line.replace(/^\d+\.\s+/, '');
      return `<li>${parseInlineFormatting(itemText)}</li>`;
    }).join('\n');
    return `<ol>\n${items}\n</ol>\n\n`;
  });

  // 11. Paragraphs (split by double newlines)
  const blocks = processed.split(/\r?\n\r?\n+/);
  const parsedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // If block starts with a tag or placeholder, don't wrap in <p>
    if (
      trimmed.startsWith('<!--MDX_PLACEHOLDER_') ||
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<div') ||
      trimmed.startsWith('<table') ||
      trimmed.startsWith('<blockquote') ||
      trimmed.startsWith('<hr')
    ) {
      return trimmed;
    }

    return `<p>${parseInlineFormatting(trimmed).replace(/\r?\n/g, '<br />')}</p>`;
  });

  let htmlResult = parsedBlocks.join('\n\n');

  // Merge adjacent lists (handles lists separated by blank lines)
  htmlResult = htmlResult.replace(/<\/ul>\s*<ul>/g, '\n');
  htmlResult = htmlResult.replace(/<\/ol>\s*<ol>/g, '\n');

  // 12. Restore placeholders
  placeholders.forEach((html, idx) => {
    const key = `<!--MDX_PLACEHOLDER_${idx}-->`;
    htmlResult = htmlResult.replace(key, html);
  });

  return {
    frontmatter,
    html: htmlResult,
    toc,
    stats: {
      wordCount,
      readTimeMinutes
    }
  };
}

/**
 * Inline formatting: Bold, Italic, Strikethrough, Code, Links, Images
 */
function parseInlineFormatting(str) {
  if (!str) return '';

  return str
    // Inline code `code`
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold & Italic ***text*** or ___text___
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    // Italic *text* or _text_
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Strikethrough ~~text~~
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    // Images: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-image" loading="lazy" />')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="content-link" target="_blank" rel="noopener">$1</a>');
}

/**
 * Markdown Table Renderer
 */
function renderTable(tableText) {
  const lines = tableText.trim().split(/\r?\n/).filter(line => line.includes('|'));
  if (lines.length < 2) return tableText;

  const headerLine = lines[0];
  const separatorLine = lines[1];
  const bodyLines = lines.slice(2);

  const parseCells = line => line.split('|').slice(1, -1).map(c => c.trim());

  const headers = parseCells(headerLine);
  const alignments = parseCells(separatorLine).map(col => {
    if (col.startsWith(':') && col.endsWith(':')) return 'center';
    if (col.endsWith(':')) return 'right';
    return 'left';
  });

  let thead = '<thead><tr>';
  headers.forEach((h, idx) => {
    const align = alignments[idx] || 'left';
    thead += `<th style="text-align: ${align}">${parseInlineFormatting(h)}</th>`;
  });
  thead += '</tr></thead>';

  let tbody = '<tbody>';
  bodyLines.forEach(line => {
    const cells = parseCells(line);
    tbody += '<tr>';
    cells.forEach((c, idx) => {
      const align = alignments[idx] || 'left';
      tbody += `<td style="text-align: ${align}">${parseInlineFormatting(c)}</td>`;
    });
    tbody += '</tr>';
  });
  tbody += '</tbody>';

  return `
<div class="table-container">
  <table class="content-table">
    ${thead}
    ${tbody}
  </table>
</div>`.trim();
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
