import { PLATFORMS, TOPICS, QUALITIES, STRATEGIES } from './data.mjs';
import { createGame, validateGame, getHotspots, getRankings, getRank, getNextGoal, getTrendData, publishVideo, startLive, getLiveEvent, replyLive, endLive, getTasks, claimTask, nextDay } from './engine.mjs';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = value => Math.round(value).toLocaleString('zh-CN');
const compact = value => value >= 10000 ? `${(value / 10000).toFixed(value >= 1000000 ? 0 : 1)}万` : num(value);
const currency = value => Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = value => `${value >= 0 ? '+' : ''}${num(value)}`;
const paths = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  video: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4z"/>',
  live: '<rect x="3" y="6" width="14" height="14" rx="3"/><path d="m17 11 4-3v10l-4-3M8 2l3 4 3-4"/>',
  chart: '<path d="M4 3v17h17M8 15l4-5 4 2 5-7"/>',
  trophy: '<path d="M8 3h8v6a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 5 4m7-7h4v3a4 4 0 0 1-5 4M12 13v7m-4 1h8"/>',
  flame: '<path d="M13 3c1 5-4 6-3 10 2-1 3-3 3-4 4 3 6 6 4 10a6 6 0 0 1-10 0C3 12 10 10 13 3z"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5a2 2 0 0 1 2-2h13m-1 9h4v5h-4a2.5 2.5 0 0 1 0-5z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="m7 14 5-5 5 5M12 9v11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 1-2 3m0 3h.01"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  sparkles: '<path d="m9 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2zm9 11 1.4 3.6L23 19l-3.6 1.4L18 24l-1.4-3.6L13 19l3.6-1.4z"/>',
  camera: '<rect x="3" y="6" width="18" height="15" rx="3"/><circle cx="12" cy="13" r="4"/><path d="m8 6 1-3h6l1 3"/>',
  coffee: '<path d="M4 8h12v7a6 6 0 0 1-12 0zm12 0h2a3 3 0 0 1 0 6h-2M7 2v2m5-2v2M2 22h18"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 17v4M8 21h8m-1-14 3 3-3 3m-6-6-3 3 3 3"/>',
  game: '<path d="M6 7h12a3 3 0 0 1 3 3l1 7a3 3 0 0 1-5 2l-3-3h-4l-3 3a3 3 0 0 1-5-2l1-7a3 3 0 0 1 3-3zM7 10v5m-2-2h4m7-2h.01m3 3h.01"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0M8 8h.01M16 8h.01"/>',
  alert: '<path d="m10 4-8 14a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3L14 4a2 2 0 0 0-4 0zM12 9v4m0 4h.01"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  gift: '<rect x="3" y="9" width="18" height="4" rx="1"/><path d="M5 13v8h14v-8M12 9v12m0-12C3 9 6 0 12 9c6-9 9 0 0 0z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1zm0 0v16"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M3 17v4h18v-4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};
function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`; }
function logo(platform = game.platform) {
  if (platform === 'douyin') return '<svg viewBox="0 0 32 36" class="platform-logo douyin-logo" aria-hidden="true"><path d="M19 2h6c0 5 3 8 7 9v6a17 17 0 0 1-7-3v12a10 10 0 1 1-10-10v6a4 4 0 1 0 4 4z" fill="#25f4ee" transform="translate(-2 1)"/><path d="M19 2h6c0 5 3 8 7 9v6a17 17 0 0 1-7-3v12a10 10 0 1 1-10-10v6a4 4 0 1 0 4 4z" fill="#fe2c55" transform="translate(1 2)"/><path d="M19 2h6c0 5 3 8 7 9v4a17 17 0 0 1-8-4v15a9 9 0 1 1-9-9v5a4 4 0 1 0 4 4z" fill="currentColor"/></svg>';
  if (platform === 'bilibili') return '<svg class="platform-logo" viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="2.8" aria-hidden="true"><rect x="3" y="9" width="34" height="24" rx="5"/><path d="m11 1 6 8m12-8-6 8M11 16v7m18-7v7m-12 4 3 2 3-2"/></svg>';
  return '<span class="redbook-logo" aria-hidden="true">小红书</span>';
}
const STORAGE = 'up-creator-simulator-v1';
let accounts = {}, active = 'douyin', onboarded = false, storageOk = true;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
  if (saved?.version === 1 && saved.accounts && typeof saved.accounts === 'object') {
    Object.entries(saved.accounts).forEach(([key, value]) => { if (validateGame(value, key)) accounts[key] = value; });
    active = accounts[saved.active] ? saved.active : 'douyin'; onboarded = Boolean(saved.onboarded && Object.keys(accounts).length);
  }
} catch { storageOk = false; }
let game = accounts[active] || createGame(active);
const ui = { route: game.live ? 'live' : 'dashboard', range: 7, metric: 'views', modal: null, filter: 'all', query: '', menu: false, draft: { title: '', topic: 'life', quality: 'standard', strategy: 'original' }, selectedPlatform: active };
let previousFocus = null;
function save() {
  accounts[game.platform] = game;
  try { localStorage.setItem(STORAGE, JSON.stringify({ version: 1, active: game.platform, onboarded, accounts })); storageOk = true; }
  catch { if (storageOk) toast('浏览器存储不可用，本次进度暂时保留在当前页面。', 'warning'); storageOk = false; }
}
function toast(text, type = 'success') {
  const el = document.createElement('div'); el.className = `toast ${type}`; el.innerHTML = `${icon(type === 'warning' ? 'alert' : 'check')}<span>${esc(text)}</span>`;
  $('#toast-root').append(el); setTimeout(() => el.remove(), 4400);
}
const routeNames = { dashboard: '账号总览', videos: '作品管理', live: '直播中心', analytics: '数据看板', rankings: '人气榜单', hotspots: '创作灵感' };
function navButton(route, label, ico, extra = '') { return `<button class="nav-item ${ui.route === route ? 'active' : ''}" data-route="${route}">${icon(ico)}<span>${label}</span>${extra}</button>`; }
function avatar(name = game.nickname, cls = '') { return `<span class="avatar ${cls}">${esc(name.slice(-2, -1) || name[0])}</span>`; }
function render() {
  document.body.dataset.platform = game.platform;
  $('#app').innerHTML = `
    <aside class="sidebar ${ui.menu ? 'mobile-open' : ''}">
      <a class="brand" href="#" data-route="dashboard"><span class="brand-mark">${logo()}</span><span>UP主模拟器<small>CREATOR SIMULATOR</small></span></a>
      <button class="account-card" data-action="account">${avatar()}<span><strong>${esc(game.nickname)}</strong><small><i class="status-dot"></i> ${PLATFORMS[game.platform].name} · 创作进行时</small></span>${icon('chevron')}</button>
      <div class="nav-label">创作工作台</div>
      <nav aria-label="主要功能">
        ${navButton('dashboard', '账号总览', 'home')}${navButton('videos', '作品管理', 'video')}${navButton('live', '直播中心', 'live', game.live ? '<span class="nav-dot"></span>' : '<span class="nav-badge">LIVE</span>')}${navButton('analytics', '数据看板', 'chart')}${navButton('rankings', '人气榜单', 'trophy')}
      </nav>
      <div class="nav-divider"></div><div class="nav-label">创作成长</div>
      <nav>${navButton('hotspots', '创作灵感', 'sparkles', '<span class="tiny-dot"></span>')}<button class="nav-item" data-action="guide">${icon('book')}<span>成长指南</span>${icon('chevron', 'nav-end')}</button></nav>
      <button class="season-card" data-route="rankings"><div>${icon('trophy')}<span>从热爱，到被看见</span></div><strong>下一站，人气创作者</strong><small>查看我的冲榜进度 ${icon('arrow')}</small><span class="season-orbit"></span></button>
      <div class="sidebar-bottom"><button data-action="guide">${icon('help')} 帮助与玩法</button><span>灵感无价 · 创作由你 <span class="version">v1.0</span></span></div>
    </aside>
    ${ui.menu ? '<button class="mobile-scrim" data-action="menu" aria-label="关闭导航"></button>' : ''}
    <div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-button menu-button" data-action="menu" aria-label="打开导航">${icon('menu')}</button><span>创作者中心</span>${icon('chevron')}<strong>${routeNames[ui.route]}</strong></div>
      <div class="header-actions"><span class="save-status"><i class="status-dot"></i>${storageOk ? '进度已自动保存' : '当前进度未保存'}</span><button class="icon-button" data-action="notifications" aria-label="消息与运营记录">${icon('bell')}<i class="notification-dot"></i></button><span class="header-divider"></span><button class="platform-switch" data-action="platform">${logo()}<span>${PLATFORMS[game.platform].name}</span>${icon('down')}</button>${avatar(game.nickname, 'header-avatar')}</div></header>
      <main id="main-content"><div class="page-heading"><div><div class="eyebrow">让每一份热爱，都有回响</div><h1>${ui.route === 'dashboard' ? '创作者工作台' : routeNames[ui.route]}</h1><p>${pageSubtitle()}</p></div><div class="day-controls"><span class="day-label">${icon('sun')} 第 <strong>${game.day}</strong> 天 <span>· 起步期</span></span><button class="button button-white" data-action="nextday">${icon('moon')} 结束今日</button></div></div>
      ${pageContent()}<footer class="page-footer"><span>UP主模拟器 <i>·</i> 每一次创作，都是新的可能</span><span>独立模拟游戏 · 非平台官方产品</span></footer></main></div>`;
  renderModal();
}
function pageSubtitle() {
  return { dashboard: `你好，${game.nickname}。今天也要创作一点不一样的。`, videos: '记录每一次创作，找到属于你的内容节奏。', live: '屏幕的另一边，是一群期待与你相遇的人。', analytics: '读懂每一个数字，让下一次创作更有方向。', rankings: '与熟悉的创作者同台，让热爱一步步被看见。', hotspots: '热点会变，灵感不停。找到下一个值得分享的故事。' }[ui.route];
}
function pageContent() { return ({ dashboard, videos: videosPage, live: livePage, analytics, rankings, hotspots: hotspotsPage })[ui.route](); }
function statCards() {
  const stats = [
    { label: '粉丝总数', value: num(game.fans), icon: 'users', color: 'coral', delta: game.today.fans, desc: '今日新增', line: [8, 7, 8, 5, 7, 3, 4, 0] },
    { label: '累计播放量', value: compact(game.views), icon: 'video', color: 'blue', delta: game.today.views, desc: '今日播放', line: [9, 7, 8, 4, 6, 2, 4, 0] },
    { label: '获赞总数', value: num(game.likes), icon: 'heart', color: 'purple', delta: game.today.videos ? game.videos.filter(v => v.day === game.day).reduce((n, v) => n + v.likes, 0) : 0, desc: '今日获赞', line: [8, 6, 7, 4, 5, 2, 3, 0] },
    { label: '累计创作收益', value: `<small>¥</small>${currency(game.revenue)}`, icon: 'wallet', color: 'orange', delta: game.today.revenue, desc: '今日收益', line: [8, 8, 6, 7, 4, 5, 2, 0] },
  ];
  return `<div class="stats-grid">${stats.map((s, i) => `<button class="stat-card" data-route="analytics"><div class="stat-top"><span>${s.label}</span><span class="stat-icon ${s.color}">${icon(s.icon)}</span></div><strong class="stat-value">${s.value}</strong><div class="stat-bottom"><span>${s.desc} <b class="${s.delta < 0 ? 'negative' : ''}">${i === 3 ? `+¥${currency(s.delta)}` : signed(s.delta)}</b></span><svg class="sparkline ${s.color}" viewBox="0 0 90 25" aria-hidden="true"><path d="${s.line.map((y, x) => `${x ? 'L' : 'M'}${x * 12 + 2} ${y * 2 + 3}`).join(' ')}" fill="none" stroke="currentColor" stroke-width="2"/></svg></div></button>`).join('')}</div>`;
}
function dashboard() {
  return `${statCards()}<div class="dashboard-grid"><div class="main-column">
    <section class="creation-banner"><div class="banner-copy"><span class="banner-tag">${icon('sparkle')} 灵感在线，热爱开场</span><h2>今天，离爆款又近一步。</h2><p>认真创作，偶尔整活。<br>下一次被看见的，就是你。</p><div class="banner-actions"><button class="button button-primary" data-action="create">${icon('plus')} 发布新作品</button><button class="button banner-secondary" data-route="live">${icon('live')} 开启直播</button></div></div><div class="banner-art" aria-hidden="true"><span class="art-orbit orbit-one"></span><span class="art-orbit orbit-two"></span><span class="art-plus plus-one">+</span><span class="art-plus plus-two">+</span><div class="art-video back-video"><img src="./assets/food.jpg" alt=""><span>把日常过成喜欢的样子</span></div><div class="art-video front-video"><img src="./assets/city.jpg" alt=""><span class="art-play">${icon('video')}</span><span>捕捉生活的每一道光</span></div><div class="floating-like">${icon('heart')} <span>1.2w</span></div><div class="floating-growth">${icon('chart')} <span>热爱正在被看见</span></div></div></section>
    ${chartPanel()}
    <section class="panel recent-panel"><div class="panel-title"><h2>最近作品 <span class="muted-count">${game.videos.length}</span></h2><button class="text-button" data-route="videos">全部作品 ${icon('chevron')}</button></div>${videoTable(game.videos.slice(0, 3), true)}</section>
    </div><aside class="right-column">${statusPanel()}${hotspotPanel()}${rankMini()}</aside></div>`;
}
function chartPanel(full = false) {
  const range = ui.range;
  const points = getTrendData(game, range, ui.metric);
  const max = Math.max(...points, 10) * 1.18;
  const w = window.matchMedia('(max-width: 760px)').matches ? 360 : 760;
  const h = 162, left = w === 360 ? 32 : 46, bottom = 143, right = w - 18;
  const coords = points.map((v, i) => [left + i * (right - left) / (range - 1), bottom - v / max * 125]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${right},${bottom} L${left},${bottom} Z`;
  const labels = Array.from({ length: 4 }, (_, i) => { const y = 18 + i * 41.5; return `<line x1="${left}" x2="${right}" y1="${y}" y2="${y}" stroke="#edf0f3" stroke-dasharray="4 4"/><text x="0" y="${y + 4}" fill="#a0a3ae" font-size="10">${compact(max * (1 - i / 3))}</text>`; }).join('');
  return `<section class="panel chart-panel ${full ? 'expanded-chart' : ''}"><div class="panel-title"><h2>数据趋势 <span class="info-dot" title="起步阶段为预设账号历史，之后记录实际运营结果">i</span></h2><div class="segmented">${[7, 14, 30].map(n => `<button data-action="range" data-value="${n}" class="${range === n ? 'selected' : ''}">近${n}天</button>`).join('')}</div></div><div class="chart-summary"><div class="chart-tabs"><button data-action="metric" data-value="views" class="${ui.metric === 'views' ? 'selected' : ''}">累计播放量</button><button data-action="metric" data-value="fans" class="${ui.metric === 'fans' ? 'selected' : ''}">粉丝总数</button></div><span><i class="legend-dot"></i>${ui.metric === 'views' ? '播放量' : '粉丝数'}</span></div><div class="chart-container"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="近${range}天${ui.metric === 'views' ? '累计播放量' : '粉丝数'}趋势"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity="0.15"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0.01"/></linearGradient></defs>${labels}<path d="${area}" fill="url(#chart-fill)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>${coords.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === range - 1 ? 4 : 2.5}" fill="white" stroke="var(--accent)" stroke-width="2"><title>${i === range - 1 ? '今天' : `前${range - 1 - i}天`}：${num(points[i])}</title></circle>`).join('')}</svg><div class="chart-axis">${Array.from({ length: Math.min(range, 7) }, (_, i) => `<span>${i === Math.min(range, 7) - 1 ? '今天' : `前${Math.round((range - 1) * (1 - i / (Math.min(range, 7) - 1)))}天`}</span>`).join('')}</div></div><div class="chart-note">${icon('sparkles')} ${game.today.views ? `今天的作品已带来 ${compact(game.today.views)} 次新曝光，继续探索你的内容节奏。` : '你的每一次尝试，都在为下一次被看见积蓄力量。'}<button data-route="analytics">查看分析 ${icon('arrow')}</button></div></section>`;
}
function statusPanel() {
  const tasks = getTasks(game), done = tasks.filter(t => t.done).length;
  return `<section class="panel status-panel"><div class="panel-title"><h2>今日创作状态</h2><span class="subtle-tag">第 ${game.day} 天</span></div><div class="energy-row"><div class="energy-icon">${icon('bolt')}</div><div><span>创作能量</span><strong>${game.energy}<small> / 100</small></strong></div><span class="energy-label">${game.energy >= 60 ? '状态满格' : game.energy >= 25 ? '灵感继续' : '休息一下'}</span></div><div class="progress"><span style="width:${game.energy}%"></span></div><div class="balance-row"><span>可用创作资金</span><strong>¥ ${currency(game.cash)}</strong></div><div class="task-heading"><span>每日小目标</span><small>${done}/3 已完成</small></div><div class="tasks">${tasks.map(t => `<button class="task ${t.done ? 'done' : ''}" data-action="task" data-id="${t.id}" ${t.claimed ? 'disabled' : ''}><span class="task-check">${t.done ? icon('check') : ''}</span><span>${t.title}<small>${t.claimed ? '奖励已领取' : t.done ? '已完成，点击领取' : t.desc}</small></span><b>${t.claimed ? icon('check') : `+¥${t.reward}`}</b></button>`).join('')}</div></section>`;
}
function hotspotPanel() {
  return `<section class="panel hotspot-panel"><div class="panel-title"><h2>${icon('flame', 'hot-icon')} 今日热点</h2><button class="text-button" data-route="hotspots">更多 ${icon('chevron')}</button></div><div class="hotspot-list">${getHotspots(game.day).slice(0, 4).map((h, i) => `<button class="hotspot-row" data-action="hotspot" data-topic="${h.category}"><b class="hot-rank rank-${i}">${i + 1}</b><span>${h.title}<small>${h.score} <span>热度</span></small></span>${h.tag ? `<i class="hot-tag ${h.tag === '新' ? 'new' : ''}">${h.tag}</i>` : icon('chevron')}</button>`).join('')}</div><div class="panel-hint">${icon('bolt')} 热点每天更新，抓住你的流量窗口</div></section>`;
}
function rankMini() {
  const goal = getNextGoal(game);
  return `<section class="panel rank-mini"><div class="panel-title"><h2>${icon('trophy')} 我的人气之路</h2><button class="text-button" data-route="rankings">榜单 ${icon('chevron')}</button></div><div class="rank-progress"><span class="rank-number"><small>NO.</small>${getRank(game)}</span><div><strong>${goal.achieved ? '你已站上人气之巅' : `向 TOP ${goal.target} 发起冲击`}</strong><small>当前热度 ${compact(game.heat)}</small></div>${icon('chart')}</div><div class="progress rank-bar"><span style="width:${Math.min(100, game.heat / goal.entry.score * 100)}%"></span></div><p>${goal.achieved ? '每一份热爱，都有了回响。' : `距离下一目标还差 ${compact(goal.gap)} 热度`}</p></section>`;
}
function videoTable(items, short = false) {
  if (!items.length) return `<div class="empty-state">${icon('video')}<h3>这里还没有匹配的作品</h3><p>换一个关键词，或创作你的下一个故事。</p><button class="button button-primary" data-action="create">发布新作品</button></div>`;
  return `<div class="table-scroll"><table class="video-table"><thead><tr><th>作品信息</th><th>播放量</th><th>点赞</th>${short ? '' : '<th>新增粉丝</th><th>创作收益</th>'}<th>状态</th><th></th></tr></thead><tbody>${items.map(v => `<tr><td><button class="video-info" data-action="video-detail" data-id="${v.id}"><span class="video-thumb"><img src="./assets/${v.image}.jpg" alt="${TOPICS.find(t => t.id === v.topic)?.name}" loading="lazy">${icon('video')}</span><span><strong>${esc(v.title)}</strong><small>${v.day > 0 ? `第 ${v.day} 天` : v.day === 0 ? '昨天' : `${1 - v.day} 天前`}发布 <i>·</i> ${TOPICS.find(t => t.id === v.topic)?.name}</small></span></button></td><td>${compact(v.views)}</td><td>${num(v.likes)}</td>${short ? '' : `<td class="${v.fans < 0 ? 'negative' : ''}">${signed(v.fans)}</td><td>¥${currency(v.revenue)}</td>`}<td><span class="video-status ${v.status === '推荐受限' ? 'restricted' : v.status === '热门作品' ? 'popular' : v.status === '推荐中' ? 'recommending' : ''}"><i></i>${v.status}</span></td><td><button class="icon-button" data-action="video-detail" data-id="${v.id}" aria-label="查看作品详情">${icon('chevron')}</button></td></tr>`).join('')}</tbody></table></div>`;
}
function videosPage() {
  const items = game.videos.filter(v => (ui.filter === 'all' || (ui.filter === 'hot' ? v.status === '热门作品' : v.status === '推荐中')) && v.title.toLowerCase().includes(ui.query.toLowerCase()));
  return `<div class="section-toolbar"><div class="filter-tabs">${[['all', '全部作品'], ['recommend', '推荐中'], ['hot', '热门作品']].map(([key, name]) => `<button data-action="filter" data-value="${key}" class="${ui.filter === key ? 'selected' : ''}">${name}${key === 'all' ? ` <span>${game.videos.length}</span>` : ''}</button>`).join('')}</div><button class="button button-primary" data-action="create">${icon('plus')} 发布新作品</button></div><section class="panel"><div class="panel-title"><h2>我的作品</h2><label class="search-field">${icon('search')}<input id="video-search" placeholder="搜索作品标题" value="${esc(ui.query)}" aria-label="搜索作品标题"></label></div><div id="video-results">${videoTable(items)}</div></section><div class="notice-bar">${icon('sparkles')} 作品会持续带来长尾播放。结束今日后，旧作品也可能收获新的关注。</div>`;
}
function livePage() {
  if (!game.live) return `<div class="live-layout"><section class="panel live-start"><div class="studio-preview"><img src="./assets/desk.jpg" alt="充满创作灵感的桌面"><div class="studio-overlay"><span class="preview-tag">${icon('live')} 我的直播间</span><div class="mic-orbit">${icon('live')}</div><h2>连接每一个真实的喜欢</h2><p>镜头就位，等你开场</p></div></div><div class="live-start-bottom"><div><h2>准备好和观众见面了吗？</h2><p>5 轮互动 · 每个回复，都会改变直播间的故事</p></div><button class="button button-primary" data-action="start-live">${icon('live')} 开始直播 <small>−25 能量</small></button></div></section><aside>${statusPanel()}<section class="panel tips-panel"><h2>开播小贴士</h2><p>${icon('heart')} 真诚回应，能把路人变成老朋友。</p><p>${icon('smile')} 玩梗活跃气氛，也要照顾观众感受。</p><p>${icon('gift')} 过度索礼可能收获礼物，也可能失去关注。</p></section></aside></div>`;
  const l = game.live, event = getLiveEvent(game), last = l.responses.at(-1);
  return `<div class="live-session-heading"><span class="live-badge"><i></i> 正在直播</span><span>互动 ${l.round}/5</span><button class="text-button" data-action="finish-live">结束直播 ${icon('arrow')}</button></div><div class="live-kpis"><div>${icon('users')}<span>当前在线<strong>${num(l.viewers)}</strong></span></div><div>${icon('heart')}<span>新增关注<strong class="${l.fans < 0 ? 'negative' : ''}">${signed(l.fans)}</strong></span></div><div>${icon('gift')}<span>礼物收益<strong>¥${currency(l.gifts)}</strong></span></div><div>${icon('chart')}<span>人气峰值<strong>${num(l.peak)}</strong></span></div></div><div class="live-layout active-live"><section class="panel interaction-panel"><div class="panel-title"><h2>${icon('live')} 实时互动</h2><span class="subtle-tag">观众正在等你回应</span></div><div class="chat-history"><div class="system-chat">${icon('users')} 欢迎来到直播间，今天也有新的相遇</div>${l.responses.map(r => `<div class="chat-line"><span class="chat-avatar">${esc(r.user[0])}</span><div><small>${esc(r.user)}</small><p>${esc(r.question || '观众互动')}</p><div class="host-reply"><b>我：</b>${esc(r.text)}</div><span class="chat-result">${esc(r.result)}</span></div></div>`).join('')}${event ? `<div class="incoming-chat"><span class="chat-avatar" style="background:${event.color}">${esc(event.user[0])}</span><div><span class="chat-name">${event.user} <small>${event.badge}</small></span><p>${event.text}</p></div><span class="chat-now">刚刚</span></div>` : `<div class="live-complete">${icon('check')}<h3>今天的相遇，圆满收官</h3><p>5 轮互动已完成，看看这次直播的收获。</p></div>`}</div>${last ? `<div class="interaction-result"><strong>${icon('sparkles')} 互动反馈</strong><p>${last.result}</p><div><span>关注 ${signed(last.fans)}</span><span>在线 ${signed(last.viewers)}</span><span>礼物 +¥${currency(last.gifts)}</span></div></div>` : ''}<div class="reply-area">${event ? `<h3>你会如何回应？<small>选择一条快捷回复，推进直播</small></h3>${event.choices.map((c, i) => `<button class="reply-choice" data-action="reply" data-value="${i}"><span>${String.fromCharCode(65 + i)}</span><div>${c.text}<small>${c.tone}</small></div>${icon('arrow')}</button>`).join('')}` : `<button class="button button-primary button-wide" data-action="finish-live">查看直播结算 ${icon('arrow')}</button>`}</div></section><aside><section class="panel audience-panel"><h2>直播间氛围</h2><div class="audience-orb">${icon('heart')}<strong>${l.intent >= 70 ? '热闹' : l.intent >= 35 ? '温暖' : '冷清'}</strong><small>每一句回应都有回响</small></div><div class="audience-stat"><span>互动意愿 <b>${l.intent}%</b></span><div class="progress"><span style="width:${l.intent}%"></span></div></div><div class="audience-stat"><span>关注意愿 <b>${l.follow}%</b></span><div class="progress blue-progress"><span style="width:${l.follow}%"></span></div></div><div class="audience-stat"><span>账号口碑 <b>${game.reputation}/100</b></span><div class="progress green-progress"><span style="width:${game.reputation}%"></span></div></div><p class="helper-text">回应改变观众的情绪，也会影响下一轮的关注和送礼意愿。</p></section><section class="panel tips-panel"><h2>这一次，做你自己</h2><p>没有永远正确的回复。有人为真诚停留，也有人为有趣而来。</p></section></aside></div>`;
}
function analytics() {
  const retention = Math.round(game.videos.reduce((n, v) => n + v.retention, 0) / game.videos.length);
  const topics = TOPICS.map(t => ({ ...t, views: game.videos.filter(v => v.topic === t.id).reduce((n, v) => n + v.views, 0) })).sort((a, b) => b.views - a.views);
  const best = [...game.videos].sort((a, b) => b.views - a.views)[0];
  return `${statCards()}${chartPanel(true)}<div class="analytics-grid"><section class="panel"><div class="panel-title"><h2>内容表现分析</h2><span class="subtle-tag">按累计播放</span></div><div class="topic-bars">${topics.filter(t => t.views).map(t => `<div><span>${icon(t.icon)}${t.name}</span><div class="progress"><span style="width:${t.views / Math.max(topics[0].views, 1) * 100}%"></span></div><strong>${compact(t.views)}</strong></div>`).join('')}</div><div class="insight">${icon('sparkles')} ${topics[0].name}是目前最受欢迎的内容，可以尝试继续深耕。</div></section><section class="panel"><div class="panel-title"><h2>账号健康度</h2><span class="healthy-tag">${game.reputation >= 70 ? '稳步成长' : '需要调整'}</span></div><div class="health-grid"><div><strong>${retention}<small>%</small></strong><span>平均完播率</span></div><div><strong>${(game.likes / Math.max(1, game.views) * 100).toFixed(1)}<small>%</small></strong><span>点赞转化率</span></div><div><strong>${game.reputation}<small>/100</small></strong><span>账号口碑</span></div></div><div class="insight">${icon('heart')} ${game.reputation >= 70 ? '稳定的口碑正在帮助你把曝光转化为长期关注。' : '近期口碑有所下降，尝试真诚原创和友好的直播互动。'}</div></section></div><section class="panel best-video"><div><span class="eyebrow">你的高光时刻</span><h2>目前表现最好的作品</h2><p>${esc(best.title)}</p><button class="text-button accent-text" data-action="video-detail" data-id="${best.id}">查看作品复盘 ${icon('arrow')}</button></div><img src="./assets/${best.image}.jpg" alt="最佳作品封面"><div><strong>${compact(best.views)}</strong><span>累计播放</span></div><div><strong>${signed(best.fans)}</strong><span>带来新粉丝</span></div></section>`;
}
function rankings() {
  const list = getRankings(game), goal = getNextGoal(game);
  return `<section class="ranking-banner"><div><span class="banner-tag">${icon('trophy')} ${PLATFORMS[game.platform].name}人气挑战</span><h2>下一位被看见的创作者，就是你。</h2><p>用每一条作品、每一次互动，走向属于你的舞台。</p><div><span>当前排名 <strong>NO.${getRank(game)}</strong></span><span>我的热度 <strong>${compact(game.heat)}</strong></span><span>历史最佳 <strong>NO.${game.bestRank}</strong></span></div></div><div class="trophy-art" aria-hidden="true">${icon('trophy')}<i></i></div></section><div class="ranking-layout"><section class="panel"><div class="panel-title"><h2>创作者人气榜</h2><span class="simulation-label">游戏模拟热度 · 非真实排名</span></div><div class="ranking-table">${list.map((r, i) => `<div class="ranking-row ${r.mine ? 'my-ranking' : ''}"><strong class="rank-position position-${i + 1}">${i < 3 ? icon('trophy') : String(r.rank).padStart(2, '0')}</strong><span class="creator-avatar creator-${i % 6}">${esc(r.name[0])}</span><div class="creator-name"><strong>${esc(r.name)} ${r.mine ? '<small>我</small>' : ''}</strong><span>${r.mine ? '每一次创作，都在靠近梦想' : `${PLATFORMS[game.platform].name}创作者`}</span></div><strong class="ranking-score">${compact(r.score)}<small>热度</small></strong><span class="rank-change ${r.change < 0 ? 'negative' : ''}">${r.change ? `${r.change > 0 ? '↑' : '↓'} ${Math.abs(r.change)}` : '—'}</span></div>`).join('')}</div><p class="ranking-source">创作者姓名来自公开资料，分数和顺序为游戏设定，不代表真实平台表现。${PLATFORMS[game.platform].sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">查看资料 ${icon('arrow')}</a>`).join('')}</p></section><aside>${rankMini()}<section class="panel tips-panel"><h2>冲榜里程碑</h2>${[{ rank: 8, text: '初露锋芒' }, { rank: 5, text: '人气新星' }, { rank: 3, text: '闪耀舞台' }, { rank: 1, text: '人气之巅' }].map(m => `<div class="milestone ${game.bestRank <= m.rank ? 'achieved' : ''}"><span>${icon(game.bestRank <= m.rank ? 'check' : 'trophy')}</span><div><strong>TOP ${m.rank} · ${m.text}</strong><small>${game.bestRank <= m.rank ? '已达成，继续发光' : '继续积累作品与互动热度'}</small></div></div>`).join('')}</section><div class="rank-footnote">热度由播放、点赞、关注和直播互动共同构成，每日少量衰减。榜上创作者也会稳步成长。</div></aside></div>`;
}
function hotspotsPage() {
  return `<div class="notice-bar">${icon('flame')} 今日流量窗口：${getHotspots(game.day).slice(0, 3).map(h => TOPICS.find(t => t.id === h.category).name).join('、')}。追热点能增加曝光，最终表现也取决于内容与运气。</div><div class="inspiration-grid">${getHotspots(game.day).map((h, i) => { const t = TOPICS.find(t => t.id === h.category); return `<article class="panel inspiration-card"><div class="inspiration-image"><img src="./assets/${t.image}.jpg" alt="${t.name}创作灵感"><span>TOP ${i + 1} ${icon('flame')}</span></div><div><span class="topic-label">${t.name} <b>${h.trend}</b></span><h2>${h.title}</h2><p>${h.desc}</p><div class="inspiration-bottom"><span>${icon('flame')} ${h.score}热度</span><button class="text-button accent-text" data-action="hotspot" data-topic="${t.id}">创作同题 ${icon('arrow')}</button></div></div></article>`; }).join('')}</div>`;
}

function openModal(type, data = {}) { previousFocus = document.activeElement; ui.modal = { type, ...data }; renderModal(); }
function closeModal() { if (ui.modal?.type === 'platform' && !onboarded) return; ui.modal = null; renderModal(); previousFocus?.focus?.(); }
function modalShell(content, cls = '', title = '') {
  return `<div class="modal-overlay ${ui.modal?.type === 'platform' && !onboarded ? 'onboarding-overlay' : ''}" data-action="overlay-close"><section class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${title}">${ui.modal?.type === 'platform' && !onboarded ? '' : `<button class="icon-button modal-close" data-action="close" aria-label="关闭弹窗">${icon('close')}</button>`}${content}</section></div>`;
}
function renderModal() {
  const m = ui.modal;
  document.body.classList.toggle('modal-open', !!m);
  if (!m) { $('#modal-root').innerHTML = ''; return; }
  let content = '';
  if (m.type === 'platform') {
    content = modalShell(`<div class="onboarding-brand">${icon('sparkles')} UP主模拟器</div><span class="eyebrow">每一份热爱，都有它的舞台</span><h2>${onboarded ? '切换你的创作主场' : '你的创作人生，从这里开始。'}</h2><p class="modal-description">选择一个平台，运营账号、与观众互动，成为下一位人气创作者。</p><div class="platform-options">${Object.values(PLATFORMS).map(p => `<button class="platform-option ${ui.selectedPlatform === p.id ? 'chosen' : ''}" data-action="select-platform" data-value="${p.id}" style="--platform-accent:${p.accent}"><span class="platform-option-head"><span class="platform-select-logo ${p.id}">${logo(p.id)}</span><span class="radio-check">${ui.selectedPlatform === p.id ? icon('check') : ''}</span></span><strong>${p.name}</strong><span class="platform-tagline">${p.tagline}</span><p>${p.description}</p><div>${p.perks.map(text => `<span>${icon('check')}${text}</span>`).join('')}</div><small>${accounts[p.id] ? `已有存档 · 第 ${accounts[p.id].day} 天` : '初始粉丝 1,286 · 资金 ¥3,000'}</small></button>`).join('')}</div><label class="nickname-label" for="nickname">创作者昵称 <span>让大家记住你</span></label><input class="text-input nickname-input" id="nickname" maxlength="16" value="${esc(m.nickname ?? accounts[ui.selectedPlatform]?.nickname ?? game.nickname)}" placeholder="起一个你喜欢的名字"><button class="button button-primary onboarding-start" data-action="enter-platform">${accounts[ui.selectedPlatform] ? '继续我的创作旅程' : '开启我的创作旅程'} ${icon('arrow')}</button><div class="onboarding-footer">${icon('check')} 三个平台独立存档 <span>·</span> 随时切换 <span>·</span> 本地自动保存</div>`, 'platform-modal', '选择创作平台');
  } else if (m.type === 'create') {
    const d = ui.draft, q = QUALITIES.find(q => q.id === d.quality);
    content = modalShell(`<span class="eyebrow">把灵感变成你的下一条作品</span><h2>发布新作品</h2><p class="modal-description">好作品不只有一个答案。选题、制作和时机，都由你决定。</p><div class="create-form"><label class="field-label" for="video-title">作品标题 <span id="title-count">${d.title.length}/40</span></label><input id="video-title" class="text-input" maxlength="40" placeholder="给这次创作起个让人想点开的名字…" value="${esc(d.title)}"><label class="field-label">选择题材</label><div class="topic-options">${TOPICS.map(t => `<button data-action="select-topic" data-value="${t.id}" class="topic-option ${d.topic === t.id ? 'chosen' : ''}">${icon(t.icon)}<span>${t.name}</span></button>`).join('')}</div><label class="field-label">制作投入 <span>高质量带来好口碑，曝光也需要一点运气</span></label><div class="quality-options">${QUALITIES.map(q => `<button data-action="select-quality" data-value="${q.id}" class="quality-option ${d.quality === q.id ? 'chosen' : ''}"><span class="radio-check">${d.quality === q.id ? icon('check') : ''}</span><strong>${q.name}</strong><small>${q.desc}</small><span>¥${q.cost} <i>·</i> ${q.energy} 能量</span></button>`).join('')}</div><label class="field-label">内容策略</label><div class="strategy-options">${STRATEGIES.map(s => `<button data-action="select-strategy" data-value="${s.id}" class="strategy-option ${d.strategy === s.id ? 'chosen' : ''}">${icon(s.icon)}<span><strong>${s.name}</strong><small>${s.desc}</small></span><span class="radio-check">${d.strategy === s.id ? icon('check') : ''}</span></button>`).join('')}</div>${d.strategy === 'edge' ? `<p class="risk-hint">${icon('alert')} 争议擦边会降低口碑，有 48% 概率遭遇模拟限流，并可能掉粉。</p>` : ''}<div class="publish-footer"><span>本次投入 <strong>¥${q.cost}</strong><small>${q.energy} 能量 · 当前可用 ¥${currency(game.cash)} / ${game.energy} 能量</small></span><button class="button button-primary" data-action="publish" ${game.cash < q.cost || game.energy < q.energy || game.live ? 'disabled' : ''}>${icon('plus')} 发布作品</button></div><p id="form-error" class="form-error" role="alert">${game.live ? '请先结束当前直播。' : game.cash < q.cost ? '资金不足，试试轻量制作、直播或任务奖励。' : game.energy < q.energy ? '能量不足，结束今日即可恢复。' : ''}</p></div>`, 'create-modal', '发布新作品');
  } else if (m.type === 'video-detail') {
    const v = game.videos.find(v => v.id === m.id);
    if (!v) { ui.modal = null; renderModal(); return; }
    content = modalShell(`<div class="result-cover"><img src="./assets/${v.image}.jpg" alt="作品封面"><span>${m.newVideo ? '新作品已发布' : '作品复盘'}</span>${icon('video')}</div><div class="result-content"><span class="eyebrow">${TOPICS.find(t => t.id === v.topic).name} · ${QUALITIES.find(q => q.id === v.quality)?.name}</span><h2>${esc(v.title)}</h2><div class="result-stats"><div><strong>${compact(v.views)}</strong><span>播放量</span></div><div><strong>${signed(v.fans)}</strong><span>新增关注</span></div><div><strong>¥${currency(v.revenue)}</strong><span>创作收益</span></div></div><div class="result-explanation">${icon('sparkles')}<p>${esc(v.explanation || '这条作品来自起步账号的预设历史。下一次创作，将由你亲手决定。')}</p></div><div class="result-metadata"><span>完播率 <b>${v.retention}%</b></span><span>点赞 <b>${num(v.likes)}</b></span><span>热度 <b>+${compact(v.heat)}</b></span>${v.cost ? `<span>制作成本 <b>¥${v.cost}</b></span>` : ''}</div><button class="button button-primary button-wide" data-action="close">${m.newVideo ? '继续我的创作之旅' : '完成复盘'} ${icon('arrow')}</button></div>`, 'result-modal', '作品数据与复盘');
  } else if (m.type === 'daily') {
    const s = m.summary;
    content = modalShell(`<div class="celebration-icon">${icon('sun')}</div><span class="eyebrow">今天的每一份努力，都算数</span><h2>第 ${s.day} 天，收工快乐。</h2><p class="modal-description">今天发布了 ${s.videos} 条作品，完成了 ${s.lives} 场直播。<br>好好休息，明天继续发光。</p><div class="result-stats"><div><strong>${signed(s.fans)}</strong><span>新增关注</span></div><div><strong>${compact(s.views)}</strong><span>新增播放</span></div><div><strong>¥${currency(s.revenue)}</strong><span>创作收益</span></div></div><div class="daily-note">${icon('bolt')} 创作能量已恢复至 100 <span>旧作品又带来 ${s.passiveFans} 位新朋友</span></div>${getRank(game) === 1 ? '<p class="winner-message">恭喜登顶人气榜！你已经成为人气之巅的创作者。</p>' : ''}<button class="button button-primary button-wide" data-action="close">出发，第 ${game.day} 天 ${icon('arrow')}</button>`, 'summary-modal', '今日经营结算');
  } else if (m.type === 'live-summary') {
    const s = m.summary;
    content = modalShell(`<div class="celebration-icon">${icon('live')}</div><span class="eyebrow">每一次互动，都是双向的奔赴</span><h2>这场直播，有你真好。</h2><p class="modal-description">完成 ${s.round} 轮互动，最高 ${num(s.peak)} 位观众同时在线。</p><div class="result-stats"><div><strong>${signed(s.fans)}</strong><span>新增关注</span></div><div><strong>¥${currency(s.gifts)}</strong><span>礼物收益</span></div><div><strong>${s.intent}%</strong><span>互动意愿</span></div></div><div class="result-explanation">${icon('heart')}<p>${s.fans >= 0 ? '观众记住的不只是你说了什么，还有被认真回应的感觉。' : '这次有一些朋友选择离开，下一次可以尝试更真诚的交流。'}</p></div><button class="button button-primary button-wide" data-action="close">回到直播中心 ${icon('arrow')}</button>`, 'summary-modal', '直播结算');
  } else if (m.type === 'guide') {
    content = modalShell(`<span class="eyebrow">新手成长指南</span><h2>你的下一站，人气创作者。</h2><p class="modal-description">这是一个关于选择、坚持，也关于运气的经营游戏。</p><div class="guide-steps">${[['video', '01', '创作你的内容', '选择题材、制作投入和策略。质量提高内容基础，但平台偏好、热点和运气也会改变曝光。'], ['live', '02', '和观众成为朋友', '每场直播有 5 轮快捷回复。真诚、幽默或强势回应，会影响关注、取关、礼物和停留。'], ['chart', '03', '让数据给你方向', '比较作品表现、完播率和口碑，找到适合平台的内容。每日任务奖励可以补充资金。'], ['trophy', '04', '向人气之巅出发', '用播放、点赞、粉丝和礼物积累热度，与真实创作者姓名组成的模拟榜单同台冲榜。']].map(([ico, n, title, text]) => `<div>${icon(ico)}<span><small>STEP ${n}</small><strong>${title}</strong><p>${text}</p></span></div>`).join('')}</div><p class="helper-text">每个账号以 1,286 位粉丝、3 条历史作品和 ¥3,000 资金起步。每日 100 能量，结束今日后恢复，并结算旧作品的长尾收益。三个平台独立存档，刷新后可继续；清除浏览器数据会移除存档。</p><button class="button button-primary button-wide" data-action="close">知道了，开始创作 ${icon('arrow')}</button>`, 'guide-modal', '游戏玩法指南');
  } else if (m.type === 'notifications') {
    content = modalShell(`<span class="eyebrow">每一步成长，都有迹可循</span><h2>运营记录</h2><div class="log-list">${game.logs.length ? game.logs.map(l => `<div>${icon(l.type === 'warning' ? 'alert' : l.type === 'success' ? 'check' : 'bell')}<span><small>第 ${l.day} 天</small><p>${esc(l.text)}</p></span></div>`).join('') : `<div class="empty-state">${icon('bell')}<h3>新的故事，等你开启</h3><p>发布作品、开启直播，你的每一步都会记录在这里。</p></div>`}</div>`, 'logs-modal', '运营记录');
  } else if (m.type === 'account') {
    content = modalShell(`${avatar(game.nickname, 'large-avatar')}<h2>${esc(game.nickname)}</h2><p class="modal-description">${PLATFORMS[game.platform].name} · 第 ${game.day} 天 · ${num(game.fans)} 位朋友</p><div class="account-details"><span>可用资金<strong>¥${currency(game.cash)}</strong></span><span>账号口碑<strong>${game.reputation}/100</strong></span><span>历史最佳排名<strong>NO.${game.bestRank}</strong></span></div><button class="button button-primary button-wide" data-action="platform">切换平台与昵称 ${icon('arrow')}</button><button class="text-button reset-button" data-action="reset-confirm">重新开始当前平台</button>`, 'summary-modal', '我的账号');
  } else if (m.type === 'reset-confirm') {
    content = modalShell(`<div class="celebration-icon">${icon('alert')}</div><h2>重新开启这段旅程？</h2><p class="modal-description">将清除 ${PLATFORMS[game.platform].name} 当前的游戏进度。其他平台的存档会保留，此操作无法撤销。</p><div class="confirm-actions"><button class="button button-white" data-action="close">继续当前旅程</button><button class="button button-primary" data-action="reset">确认重新开始</button></div>`, 'summary-modal', '确认重新开始');
  }
  $('#modal-root').innerHTML = content;
  queueMicrotask(() => { const focus = $('.modal [autofocus]') || $('.modal button:not(.modal-close)') || $('.modal input'); focus?.focus({ preventScroll: true }); });
}

function syncDraft() { const input = $('#video-title'); if (input) ui.draft.title = input.value; }
function create(topic, strategy) { ui.draft = { title: '', topic: topic || 'life', quality: 'standard', strategy: strategy || 'original' }; openModal('create'); }
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action], [data-route]');
  if (!el || el.disabled) return;
  if (el.matches('a')) e.preventDefault();
  try {
    if (el.dataset.route) { ui.route = el.dataset.route; ui.menu = false; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const action = el.dataset.action, value = el.dataset.value;
    switch (action) {
      case 'overlay-close': if (e.target === el) closeModal(); break;
      case 'close': closeModal(); break;
      case 'menu': ui.menu = !ui.menu; render(); break;
      case 'platform': ui.selectedPlatform = game.platform; openModal('platform'); break;
      case 'select-platform': { const input = $('#nickname'); if (input) ui.modal.nickname = input.value; ui.selectedPlatform = value; if (accounts[value]) ui.modal.nickname = accounts[value].nickname; renderModal(); break; }
      case 'enter-platform': { const name = $('#nickname').value.trim(); if (!name) { $('#nickname').focus(); toast('先给自己起个昵称吧。', 'warning'); break; } accounts[game.platform] = game; game = accounts[ui.selectedPlatform] || createGame(ui.selectedPlatform, name); game.nickname = name.slice(0, 16); onboarded = true; ui.route = game.live ? 'live' : 'dashboard'; ui.modal = null; save(); render(); toast(`欢迎来到${PLATFORMS[game.platform].name}，你的创作主场已就位。`); break; }
      case 'create': create(); break;
      case 'hotspot': create(el.dataset.topic, 'trend'); break;
      case 'select-topic': syncDraft(); ui.draft.topic = value; renderModal(); break;
      case 'select-quality': syncDraft(); ui.draft.quality = value; renderModal(); break;
      case 'select-strategy': syncDraft(); ui.draft.strategy = value; renderModal(); break;
      case 'publish': { syncDraft(); try { const video = publishVideo(game, ui.draft); save(); ui.modal = { type: 'video-detail', id: video.id, newVideo: true }; render(); } catch (err) { $('#form-error').textContent = err.message; $('#video-title')?.focus(); } break; }
      case 'video-detail': openModal('video-detail', { id: el.dataset.id }); break;
      case 'start-live': startLive(game); save(); render(); break;
      case 'reply': replyLive(game, Number(value)); save(); render(); break;
      case 'finish-live': { const summary = endLive(game); save(); ui.modal = { type: 'live-summary', summary }; render(); break; }
      case 'nextday': { const summary = nextDay(game); save(); ui.modal = { type: 'daily', summary }; render(); break; }
      case 'task': { const task = getTasks(game).find(t => t.id === el.dataset.id); if (task.done) { const reward = claimTask(game, task.id); save(); render(); toast(`小目标达成，创作资金 +¥${reward}！`); } else { ui.route = task.id === 'live' ? 'live' : task.id === 'video' ? 'videos' : 'analytics'; render(); } break; }
      case 'range': ui.range = Number(value); render(); break;
      case 'metric': ui.metric = value; render(); break;
      case 'filter': ui.filter = value; render(); break;
      case 'guide': openModal('guide'); break;
      case 'notifications': openModal('notifications'); break;
      case 'account': openModal('account'); break;
      case 'reset-confirm': openModal('reset-confirm'); break;
      case 'reset': game = createGame(game.platform, game.nickname); save(); ui.modal = null; ui.route = 'dashboard'; render(); toast('新的创作旅程已经开始。'); break;
    }
  } catch (err) { toast(err.message || '操作没有完成，请再试一次。', 'warning'); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'video-title') { ui.draft.title = e.target.value; $('#title-count').textContent = `${e.target.value.length}/40`; }
  if (e.target.id === 'nickname' && ui.modal) ui.modal.nickname = e.target.value;
  if (e.target.id === 'video-search') { ui.query = e.target.value; const items = game.videos.filter(v => (ui.filter === 'all' || (ui.filter === 'hot' ? v.status === '热门作品' : v.status === '推荐中')) && v.title.toLowerCase().includes(ui.query.toLowerCase())); $('#video-results').innerHTML = videoTable(items); }
});
document.addEventListener('keydown', e => {
  if (!ui.modal) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    const focusable = [...document.querySelectorAll('.modal button:not([disabled]), .modal input, .modal a')];
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }
});
if (!onboarded) ui.modal = { type: 'platform' };
render();
