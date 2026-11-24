(function () {
  function applyStoryBackground(cfg) {
    const isStory = location.pathname.includes('/community/entrystory') || location.pathname.includes('/entry-story');
    if (!isStory) return;

    let styleEl = document.getElementById('eass-story-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'eass-story-style';
      document.head.appendChild(styleEl);
    }

    const bgImageRule = cfg.storyBgUrl
      ? `background-image: url("${cfg.storyBgUrl.replace(/"/g, '')}") !important; background-size: cover !important; background-attachment: fixed !important;`
      : '';

    const glassRule = cfg.storyGlass
      ? `article, [class*="story"], [class*="card"] { background-color: rgba(255, 255, 255, 0.85) !important; backdrop-filter: blur(4px); }`
      : '';

    styleEl.textContent = `
      body, #__next, main {
        background-color: ${cfg.storyBgColor || '#eef4ff'} !important;
        ${bgImageRule}
      }
      ${glassRule}
    `;
  }

  function renderMiniStoryWidget(enabled) {
    const isWorkspace = location.pathname.includes('/ws');
    const existing = document.getElementById('eass-mini-story');
    if (!isWorkspace || !enabled) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const wrap = document.createElement('div');
    wrap.id = 'eass-mini-story';
    wrap.style.cssText = `
      position: fixed; right: 16px; bottom: 16px; width: 340px; height: 420px;
      z-index: 99999; background: #fff; border: 1px solid #cbd5e1;
      border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden; resize: both;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      padding: 8px 10px; background: #1e293b; color: #fff; font-size: 12px;
      font-weight: 700; display: flex; justify-content: space-between; align-items: center;
      cursor: move; user-select: none;
    `;
    header.innerHTML = `<span>💬 엔트리 이야기</span><button id="eass-close-mini" style="background:none;border:none;color:#fff;cursor:pointer;font-size:14px;">✕</button>`;

    const iframe = document.createElement('iframe');
    iframe.src = 'https://playentry.org/community/entrystory/list';
    iframe.style.cssText = 'flex:1; width:100%; border:none;';

    wrap.appendChild(header);
    wrap.appendChild(iframe);
    document.body.appendChild(wrap);

    let dragging = false, offsetX = 0, offsetY = 0;
    header.addEventListener('mousedown', e => {
      if (e.target.id === 'eass-close-mini') return;
      dragging = true;
      offsetX = e.clientX - wrap.getBoundingClientRect().left;
      offsetY = e.clientY - wrap.getBoundingClientRect().top;
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      wrap.style.left = `${e.clientX - offsetX}px`;
      wrap.style.top = `${e.clientY - offsetY}px`;
      wrap.style.right = 'auto';
      wrap.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => { dragging = false; });

    document.getElementById('eass-close-mini').addEventListener('click', () => {
      wrap.remove();
      chrome.storage.local.set({ miniStoryEnabled: false });
    });
  }

  function refreshAll() {
    chrome.storage.local.get(['storyBgColor', 'storyBgUrl', 'storyGlass', 'miniStoryEnabled'], data => {
      applyStoryBackground(data);
      renderMiniStoryWidget(data.miniStoryEnabled !== false);
    });
  }

  refreshAll();
  chrome.storage.onChanged.addListener(refreshAll);
})();
