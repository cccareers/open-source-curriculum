/**
 * Video Helper
 * Analyzes video URLs (YouTube, Vimeo, Loom, Direct MP4/WebM) and generates
 * responsive, accessible player markup.
 */

export function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. YouTube
  // Matches: youtube.com/watch?v=XYZ, youtu.be/XYZ, youtube.com/embed/XYZ
  const ytMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      id: videoId,
      originalUrl: trimmed,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      title: 'YouTube video player'
    };
  }

  // 2. Vimeo
  // Matches: vimeo.com/123456789 or player.vimeo.com/video/123456789
  const vimeoMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      id: videoId,
      originalUrl: trimmed,
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1&app_id=122963`,
      title: 'Vimeo video player'
    };
  }

  // 3. Loom
  // Matches: loom.com/share/XYZ or loom.com/embed/XYZ
  const loomMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'loom',
      id: videoId,
      originalUrl: trimmed,
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      title: 'Loom video player'
    };
  }

  // 4. Direct video files (mp4, webm, ogv, mov)
  const isDirectVideo = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i.test(trimmed);
  if (isDirectVideo) {
    return {
      type: 'direct',
      originalUrl: trimmed,
      embedUrl: trimmed,
      title: 'Video player'
    };
  }

  return null;
}

/**
 * Generates responsive HTML markup for a video embed
 */
export function renderVideoPlayer(videoInfo, customTitle = '') {
  if (!videoInfo) return '';

  const displayTitle = customTitle || videoInfo.title || 'Course Video';

  if (videoInfo.type === 'direct') {
    return `
<div class="course-video-wrapper direct-video" data-video-type="direct">
  <div class="video-header-bar">
    <span class="video-icon">🎥</span>
    <span class="video-title">${escapeHtml(displayTitle)}</span>
  </div>
  <div class="video-player-container">
    <video controls preload="metadata" playsinline class="custom-video-element">
      <source src="${escapeHtml(videoInfo.embedUrl)}">
      Your browser does not support the video tag. <a href="${escapeHtml(videoInfo.originalUrl)}" target="_blank" rel="noopener">Download video</a>
    </video>
  </div>
  <div class="video-controls-bar">
    <div class="speed-selector-group">
      <label class="speed-label">Speed:</label>
      <button type="button" class="speed-btn" data-speed="0.75">0.75x</button>
      <button type="button" class="speed-btn active" data-speed="1.0">1x</button>
      <button type="button" class="speed-btn" data-speed="1.25">1.25x</button>
      <button type="button" class="speed-btn" data-speed="1.5">1.5x</button>
      <button type="button" class="speed-btn" data-speed="2.0">2x</button>
    </div>
  </div>
</div>`.trim();
  }

  // Iframe player (YouTube, Vimeo, Loom)
  return `
<div class="course-video-wrapper iframe-video" data-video-type="${videoInfo.type}">
  <div class="video-header-bar">
    <span class="video-icon">🎥</span>
    <span class="video-title">${escapeHtml(displayTitle)}</span>
    <span class="video-badge">${videoInfo.type.toUpperCase()}</span>
  </div>
  <div class="video-responsive-frame">
    <iframe
      src="${escapeHtml(videoInfo.embedUrl)}"
      title="${escapeHtml(displayTitle)}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy">
    </iframe>
  </div>
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
