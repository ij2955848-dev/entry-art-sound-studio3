const baseColor = document.getElementById('baseColor');
const hexOut = document.getElementById('hexOut');
const paletteRow = document.getElementById('paletteRow');
const copyStatus = document.getElementById('copyStatus');

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function renderPalette(hex) {
  hexOut.value = hex.toUpperCase();
  const [r, g, b] = hexToRgb(hex);
  const colors = [
    rgbToHex(r + 35, g + 35, b + 35),
    rgbToHex(r - 35, g - 35, b - 35),
    rgbToHex(255 - r, 255 - g, 255 - b),
    rgbToHex(b, r, g)
  ];
  paletteRow.innerHTML = '';
  colors.forEach(c => {
    const div = document.createElement('div');
    div.className = 'swatch';
    div.style.background = c;
    div.title = c.toUpperCase();
    div.onclick = () => {
      navigator.clipboard.writeText(c.toUpperCase());
      copyStatus.textContent = `${c.toUpperCase()} 복사됨!`;
    };
    paletteRow.appendChild(div);
  });
}
baseColor.addEventListener('input', () => renderPalette(baseColor.value));
renderPalette(baseColor.value);

const origPx = document.getElementById('origPx');
const entryPct = document.getElementById('entryPct');
const calcOut = document.getElementById('calcOut');
function updateCalc() {
  const px = ((Number(origPx.value) || 0) * (Number(entryPct.value) || 0)) / 100;
  calcOut.textContent = `실제 화면 크기: ${px.toFixed(1)}px (무대 480×270 기준)`;
}
origPx.addEventListener('input', updateCalc);
entryPct.addEventListener('input', updateCalc);

const bpmInput = document.getElementById('bpmInput');
const bpmOut = document.getElementById('bpmOut');
const tapBtn = document.getElementById('tapBtn');
let taps = [];
function updateBpm() {
  const bpm = Math.max(1, Number(bpmInput.value) || 120);
  const beat = 60 / bpm;
  bpmOut.textContent = `1박자: ${beat.toFixed(3)}초 / 반박자: ${(beat / 2).toFixed(3)}초 / 1마디: ${(beat * 4).toFixed(3)}초`;
}
tapBtn.addEventListener('click', () => {
  const now = Date.now();
  taps = taps.filter(t => now - t < 3000);
  taps.push(now);
  if (taps.length >= 2) {
    const diffs = [];
    for (let i = 1; i < taps.length; i++) diffs.push(taps[i] - taps[i - 1]);
    const avgSec = (diffs.reduce((a, b) => a + b, 0) / diffs.length) / 1000;
    bpmInput.value = Math.round(60 / avgSec);
    updateBpm();
  }
});
bpmInput.addEventListener('input', updateBpm);
updateBpm();

const storyBgColor = document.getElementById('storyBgColor');
const storyBgUrl = document.getElementById('storyBgUrl');
const storyGlass = document.getElementById('storyGlass');
const toggleMiniStory = document.getElementById('toggleMiniStory');

chrome.storage.local.get(['storyBgColor', 'storyBgUrl', 'storyGlass', 'miniStoryEnabled'], data => {
  if (data.storyBgColor) storyBgColor.value = data.storyBgColor;
  if (data.storyBgUrl) storyBgUrl.value = data.storyBgUrl;
  if (typeof data.storyGlass === 'boolean') storyGlass.checked = data.storyGlass;
  if (typeof data.miniStoryEnabled === 'boolean') toggleMiniStory.checked = data.miniStoryEnabled;
});

document.getElementById('saveStoryStyle').addEventListener('click', () => {
  chrome.storage.local.set({
    storyBgColor: storyBgColor.value,
    storyBgUrl: storyBgUrl.value.trim(),
    storyGlass: storyGlass.checked
  });
});

document.getElementById('saveMiniStory').addEventListener('click', () => {
  chrome.storage.local.set({ miniStoryEnabled: toggleMiniStory.checked });
});
