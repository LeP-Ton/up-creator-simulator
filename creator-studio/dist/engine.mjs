import { PLATFORMS, TOPICS, QUALITIES, STRATEGIES, HOTSPOTS, LIVE_EVENTS, SEED_VIDEOS } from './data.mjs';

export const SAVE_VERSION = 1;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const money = n => Math.round(n * 100) / 100;
const sample = rng => clamp(Number(rng()) || 0, 0, 0.999999);
export function createGame(platform = 'douyin', nickname = '认真生活的阿愿') {
  if (!PLATFORMS[platform]) throw new Error('请选择有效的平台');
  return {
    version: SAVE_VERSION, platform, nickname: nickname.trim().slice(0, 16) || '认真生活的阿愿',
    day: 1, energy: 100, cash: 3000, fans: 1286, views: 86420, likes: 7742, revenue: 268.5, reputation: 80, heat: 18000,
    videos: structuredClone(SEED_VIDEOS), history: [], logs: [], live: null, liveCount: 0,
    today: { videos: 0, lives: 0, fans: 0, views: 0, revenue: 0 }, claimed: [], bestRank: 9,
  };
}

export function getHotspots(day) {
  const offset = (day - 1) % HOTSPOTS.length;
  return [...HOTSPOTS.slice(offset), ...HOTSPOTS.slice(0, offset)];
}
export function getRankings(game) {
  const scores = [980000, 735000, 548000, 392000, 267000, 158000, 78000, 35000];
  const list = PLATFORMS[game.platform].creators.map((name, i) => ({ name, score: Math.round(scores[i] * (1 + (game.day - 1) * 0.008)), mine: false, change: [0, 1, -1, 2, 0, 1, -2, 0][i] }));
  list.push({ name: game.nickname, score: Math.round(game.heat), mine: true, change: 0 });
  return list.sort((a, b) => b.score - a.score).map((item, i) => ({ ...item, rank: i + 1 }));
}
export const getRank = game => getRankings(game).find(item => item.mine).rank;
export function getTrendData(game, range, metric = 'views') {
  const initialFans = 1286 - SEED_VIDEOS.reduce((sum, video) => sum + video.fans, 0);
  return Array.from({ length: range }, (_, index) => {
    const day = game.day - range + 1 + index;
    if (day === game.day) return metric === 'views' ? game.views : game.fans;
    if (day <= 0) {
      const seed = SEED_VIDEOS.filter(video => video.day <= day);
      return metric === 'views' ? seed.reduce((sum, video) => sum + video.views, 0) : initialFans + seed.reduce((sum, video) => sum + video.fans, 0);
    }
    const entry = game.history.find(item => item.day === day);
    if (!entry) return metric === 'views' ? 86420 : 1286;
    return metric === 'views' ? (entry.totalViews ?? 86420 + game.history.filter(item => item.day <= day).reduce((sum, item) => sum + item.views, 0)) : entry.totalFans;
  });
}
export function getNextGoal(game) {
  const rank = getRank(game);
  const target = rank > 8 ? 8 : rank > 5 ? 5 : rank > 3 ? 3 : 1;
  const entry = getRankings(game).find(item => item.rank === target);
  return { target, entry, gap: Math.max(0, entry.score - game.heat), achieved: rank === 1 };
}
function log(game, text, type = 'info') {
  game.logs.unshift({ id: `${game.day}-${game.logs.length}-${game.heat}`, day: game.day, text, type });
  game.logs = game.logs.slice(0, 40);
  game.bestRank = Math.min(game.bestRank, getRank(game));
}
export function getVideoCost(quality) {
  const q = QUALITIES.find(item => item.id === quality);
  if (!q) throw new Error('制作方式无效');
  return { cost: q.cost, energy: q.energy };
}

export function publishVideo(game, config, rng = Math.random) {
  if (game.live) throw new Error('请先结束正在进行的直播');
  const topic = TOPICS.find(item => item.id === config.topic);
  const quality = QUALITIES.find(item => item.id === config.quality);
  const strategy = STRATEGIES.find(item => item.id === config.strategy);
  const title = String(config.title || '').trim();
  if (!topic || !quality || !strategy) throw new Error('请选择完整的创作方案');
  if (!title || title.length > 40) throw new Error('作品标题需要为 1～40 个字');
  if (game.energy < quality.energy) throw new Error('创作能量不足，结束今日即可恢复');
  if (game.cash < quality.cost) throw new Error('创作资金不足，可以先开直播或领取任务奖励');
  const p = PLATFORMS[game.platform];
  const luckRoll = sample(rng);
  const luck = luckRoll > 0.9 ? 3.6 : luckRoll < 0.13 ? 0.28 : 0.65 + luckRoll * 1.55;
  const hot = getHotspots(game.day).slice(0, 3).some(h => h.category === topic.id);
  const strategyFactor = strategy.id === 'trend' ? (hot ? 2.15 : 1.1) * p.weights.trend : strategy.id === 'meme' ? 1.75 * p.weights.meme : strategy.id === 'edge' ? 2.3 : 1.05;
  // 质量提升内容基础与长期信任，分发还受平台、热点与随机流量池影响。
  const qualityFactor = 0.65 + quality.factor * p.weights.quality * 0.55;
  const restricted = strategy.id === 'edge' && sample(rng) < 0.48;
  const trustFactor = 0.55 + game.reputation / 160;
  const views = Math.round((6000 + game.fans * 2.1) * qualityFactor * strategyFactor * topic.affinity[game.platform] * luck * trustFactor * (restricted ? 0.08 : 1));
  const retention = Math.round(clamp(22 + quality.quality * 0.38 + sample(rng) * 14 + (hot ? 6 : 0) - (strategy.id === 'edge' ? 15 : 0), 12, 92));
  const likes = Math.round(views * (0.025 + retention / 1700));
  const lostFans = strategy.id === 'edge' ? Math.round(game.fans * (restricted ? 0.04 : 0.012)) : 0;
  const fans = Math.round(views * (0.004 + quality.quality / 14000) * (game.reputation / 100)) - lostFans;
  const revenue = money(views * (0.0016 + sample(rng) * 0.0018) * p.weights.gift);
  const heat = Math.round(views * 0.7 + likes * 3.5 + Math.max(fans, 0) * 12);
  const explanation = restricted ? '争议内容触发模拟限流，流量下滑，部分粉丝选择离开。' : luckRoll > 0.9 ? '被幸运的推荐流量池选中！内容意外破圈，这次运气站在你这边。' : luckRoll < 0.13 ? '这次没有遇上合适的推荐窗口。认真制作也可能暂时无人问津。' : strategy.id === 'trend' && hot ? '选题踩中今日热点，获得了额外的推荐曝光。' : strategy.id === 'meme' ? '观众接住了你的梗，互动带来了更多推荐。' : '作品找到了喜欢它的观众，真诚和质量正在慢慢积累口碑。';
  const video = { id: `video-${game.day}-${game.videos.length}`, title, topic: topic.id, image: topic.image, quality: quality.id, strategy: strategy.id, day: game.day, views, likes, fans, revenue, heat, retention, status: restricted ? '推荐受限' : luckRoll > 0.9 ? '热门作品' : '推荐中', explanation, luck: luckRoll, cost: quality.cost };
  game.cash = money(game.cash - quality.cost + revenue);
  game.energy -= quality.energy;
  game.fans = Math.max(0, game.fans + fans);
  game.views += views; game.likes += likes; game.revenue = money(game.revenue + revenue); game.heat += heat;
  game.reputation = clamp(game.reputation + strategy.reputation + (quality.id === 'premium' ? 3 : 0), 10, 100);
  game.today.videos++; game.today.fans += fans; game.today.views += views; game.today.revenue = money(game.today.revenue + revenue);
  game.videos.unshift(video);
  log(game, `发布《${title}》，获得 ${views.toLocaleString('zh-CN')} 次播放。${explanation}`, restricted ? 'warning' : 'success');
  return video;
}

export function startLive(game, rng = Math.random) {
  if (game.live) throw new Error('直播正在进行中');
  if (game.energy < 25) throw new Error('开启直播需要 25 点能量，结束今日即可恢复');
  game.energy -= 25;
  game.live = { round: 0, eventOffset: game.liveCount % LIVE_EVENTS.length, viewers: Math.round(50 + game.fans * (0.05 + sample(rng) * 0.06)), peak: 0, fans: 0, gifts: 0, intent: 45, follow: 40, responses: [], settled: false };
  game.live.peak = game.live.viewers;
  log(game, '直播已开启，第一批观众正在进入直播间。');
  return game.live;
}
export function getLiveEvent(game) {
  if (!game.live || game.live.round >= 5) return null;
  return LIVE_EVENTS[(game.live.eventOffset + game.live.round) % LIVE_EVENTS.length];
}
export function replyLive(game, index, rng = Math.random) {
  const live = game.live;
  const event = getLiveEvent(game);
  if (!live || !event) throw new Error('当前没有待回应的互动');
  const choice = event.choices[index];
  if (!choice) throw new Error('请选择一个有效回复');
  const scale = (0.75 + sample(rng) * 0.5) * (1 + game.fans / 12000);
  const fans = Math.round(choice.fans * scale * (0.75 + live.follow / 100));
  const gifts = money(choice.gifts * scale * PLATFORMS[game.platform].weights.gift * (0.7 + live.intent / 100));
  const viewers = Math.round(choice.viewers * scale);
  const actualFans = Math.max(-game.fans, fans);
  const result = { text: choice.text, question: event.text, user: event.user, result: choice.result, fans: actualFans, gifts, viewers, intent: choice.intent, follow: choice.follow };
  live.viewers = Math.max(0, live.viewers + viewers); live.peak = Math.max(live.peak, live.viewers);
  live.fans += actualFans; live.gifts = money(live.gifts + gifts);
  live.intent = clamp(live.intent + choice.intent, 0, 100); live.follow = clamp(live.follow + choice.follow, 0, 100);
  live.responses.push(result); live.round++;
  game.fans += actualFans; game.cash = money(game.cash + gifts); game.revenue = money(game.revenue + gifts);
  game.heat += Math.round(Math.max(0, actualFans) * 55 + Math.max(0, viewers) * 14 + gifts * 30);
  game.reputation = clamp(game.reputation + choice.reputation, 10, 100);
  game.today.fans += actualFans; game.today.revenue = money(game.today.revenue + gifts);
  game.bestRank = Math.min(game.bestRank, getRank(game));
  return result;
}
export function endLive(game) {
  if (!game.live) throw new Error('当前没有进行中的直播');
  const summary = structuredClone(game.live);
  game.live = null; game.liveCount++;
  if (summary.round === 5) game.today.lives++;
  log(game, `直播结束：新增关注 ${summary.fans}，礼物收益 ¥${summary.gifts.toFixed(2)}。`, 'success');
  return summary;
}
export function getTasks(game) {
  return [
    { id: 'video', title: '发布一条新作品', desc: '让灵感成为作品', reward: 120, done: game.today.videos > 0 },
    { id: 'live', title: '和观众聊聊天', desc: '完成一场直播互动', reward: 150, done: game.today.lives > 0 },
    { id: 'fans', title: '收获 100 位新朋友', desc: '今日新增关注达到 100', reward: 200, done: game.today.fans >= 100 },
  ].map(t => ({ ...t, claimed: game.claimed.includes(t.id) }));
}
export function claimTask(game, id) {
  const task = getTasks(game).find(item => item.id === id);
  if (!task || !task.done || task.claimed) throw new Error('任务尚未完成或奖励已领取');
  game.claimed.push(id); game.cash = money(game.cash + task.reward);
  log(game, `领取任务「${task.title}」奖励：¥${task.reward}。`, 'success');
  return task.reward;
}
export function nextDay(game, rng = Math.random) {
  if (game.live) throw new Error('请先结束直播再结算今日');
  const previousRank = getRank(game);
  const passiveViews = Math.round(game.videos.slice(0, 5).reduce((sum, v) => sum + v.views, 0) * (0.025 + sample(rng) * 0.045));
  const passiveFans = Math.round(passiveViews * 0.005 * game.reputation / 100);
  const passiveRevenue = money(passiveViews * 0.002);
  game.fans += passiveFans; game.views += passiveViews; game.revenue = money(game.revenue + passiveRevenue); game.cash = money(game.cash + passiveRevenue);
  game.heat = Math.round(game.heat * 0.96 + passiveViews * 0.7 + passiveFans * 18);
  const summary = { day: game.day, fans: game.today.fans + passiveFans, views: game.today.views + passiveViews, revenue: money(game.today.revenue + passiveRevenue), totalFans: game.fans, totalViews: game.views, rank: getRank(game), previousRank, videos: game.today.videos, lives: game.today.lives, passiveFans, passiveViews };
  game.history.push(summary); game.history = game.history.slice(-90);
  game.day++; game.energy = 100; game.claimed = []; game.today = { videos: 0, lives: 0, fans: 0, views: 0, revenue: 0 };
  log(game, `第 ${summary.day} 天已结算，旧作品带来 ${passiveFans} 位新增关注，能量已恢复。`, 'success');
  return summary;
}

// 只接受本应用结构的有限数值，避免损坏存档让运营计算变为 NaN。
export function validateGame(value, platform) {
  if (!value || value.version !== SAVE_VERSION || value.platform !== platform || !PLATFORMS[platform]) return false;
  if (typeof value.nickname !== 'string' || !value.nickname.trim() || value.nickname.length > 16) return false;
  const keys = ['day', 'energy', 'cash', 'fans', 'views', 'likes', 'revenue', 'reputation', 'heat', 'liveCount', 'bestRank'];
  if (!keys.every(k => Number.isFinite(value[k]) && value[k] >= 0)) return false;
  if (!Number.isInteger(value.day) || value.day < 1 || value.energy > 100 || value.reputation > 100) return false;
  if (!['videos', 'history', 'logs', 'claimed'].every(k => Array.isArray(value[k]))) return false;
  if (!value.today || !['videos', 'lives', 'fans', 'views', 'revenue'].every(k => Number.isFinite(value.today[k]))) return false;
  if (!value.videos.every(v => v && typeof v.title === 'string' && ['views', 'likes', 'fans', 'revenue', 'heat', 'retention'].every(k => Number.isFinite(v[k])) && TOPICS.some(t => t.id === v.topic))) return false;
  if (!value.history.every(h => h && ['day', 'fans', 'views', 'revenue', 'totalFans'].every(k => Number.isFinite(h[k])))) return false;
  if (!value.logs.every(l => l && typeof l.text === 'string')) return false;
  if (value.live && (!Number.isInteger(value.live.round) || value.live.round < 0 || value.live.round > 5 || !Number.isInteger(value.live.eventOffset) || !Array.isArray(value.live.responses) || !['viewers', 'peak', 'fans', 'gifts', 'intent', 'follow'].every(k => Number.isFinite(value.live[k])))) return false;
  return true;
}
