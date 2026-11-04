import test from 'node:test';
import assert from 'node:assert/strict';
import { PLATFORMS } from '../dist/data.mjs';
import { createGame, validateGame, getRank, getRankings, getNextGoal, getTrendData, publishVideo, startLive, replyLive, getLiveEvent, endLive, claimTask, nextDay, getHotspots } from '../dist/engine.mjs';

const config = { title: '用镜头记录普通的一天', topic: 'life', quality: 'standard', strategy: 'original' };
const constant = value => () => value;
const sequence = (...values) => { let index = 0; return () => values[Math.min(index++, values.length - 1)]; };

test('三平台账号彼此独立，初始存档能够通过校验', () => {
  const games = Object.keys(PLATFORMS).map(p => createGame(p));
  games.forEach(g => assert.equal(validateGame(g, g.platform), true));
  publishVideo(games[0], config, constant(0.5));
  assert.equal(games[1].videos.length, 3);
  assert.equal(games[2].energy, 100);
  assert.throws(() => createGame('unknown'), /有效/);
});

test('发布扣除投入与能量，收益和各项总数只入账一次', () => {
  const game = createGame();
  const old = structuredClone(game);
  const video = publishVideo(game, config, constant(0.5));
  assert.equal(game.energy, 70);
  assert.equal(game.cash, Math.round((old.cash - 220 + video.revenue) * 100) / 100);
  assert.equal(game.fans, old.fans + video.fans);
  assert.equal(game.views, old.views + video.views);
  assert.equal(game.videos.length, 4);
  assert.equal(game.today.videos, 1);
  assert.equal(game.today.views, video.views);
});

test('能量、资金或标题不足时，发布失败且不会改变账号', () => {
  for (const [field, value, message] of [['energy', 0, /能量不足/], ['cash', 0, /资金不足/]]) {
    const game = createGame(); game[field] = value;
    const old = structuredClone(game);
    assert.throws(() => publishVideo(game, config), message);
    assert.deepEqual(game, old);
  }
  assert.throws(() => publishVideo(createGame(), { ...config, title: ' ' }), /标题/);
});

test('高质量作品也可能因运气输给轻量热点作品', () => {
  const premium = publishVideo(createGame(), { ...config, quality: 'premium' }, constant(0.02));
  const quick = publishVideo(createGame(), { ...config, quality: 'quick', strategy: 'trend' }, constant(0.95));
  assert.ok(quick.views > premium.views * 2);
  assert.match(premium.explanation, /暂时无人问津/);
  assert.match(quick.explanation, /意外破圈/);
});

test('平台偏好确实影响相同选题与制作方案的流量', () => {
  const tech = { ...config, topic: 'tech', quality: 'premium' };
  const bili = publishVideo(createGame('bilibili'), tech, constant(0.5));
  const douyin = publishVideo(createGame('douyin'), tech, constant(0.5));
  assert.ok(bili.views > douyin.views);
  const fashion = { ...config, topic: 'fashion' };
  const red = publishVideo(createGame('xiaohongshu'), fashion, constant(0.5));
  const biliFashion = publishVideo(createGame('bilibili'), fashion, constant(0.5));
  assert.ok(red.views > biliFashion.views);
});

test('争议擦边可触发限流与取关，未限流也会降低口碑', () => {
  const game = createGame();
  const limited = publishVideo(game, { ...config, strategy: 'edge' }, sequence(0.5, 0.01, 0.5));
  assert.equal(limited.status, '推荐受限');
  assert.ok(limited.fans < 0);
  assert.equal(game.reputation, 68);
  const clean = createGame();
  const unrestricted = publishVideo(clean, { ...config, strategy: 'edge' }, sequence(0.5, 0.99, 0.5));
  assert.notEqual(unrestricted.status, '推荐受限');
  assert.equal(clean.reputation, 68);
});

test('五轮直播能带来关注、礼物和情绪变化，并可中途保存恢复', () => {
  const game = createGame();
  startLive(game, constant(0.5));
  assert.equal(game.energy, 75);
  assert.throws(() => startLive(game), /进行中/);
  const before = game.cash;
  for (let i = 0; i < 5; i++) {
    assert.ok(getLiveEvent(game));
    replyLive(game, 0, constant(0.5));
    assert.equal(validateGame(JSON.parse(JSON.stringify(game)), game.platform), true);
  }
  assert.equal(getLiveEvent(game), null);
  assert.throws(() => replyLive(game, 0), /没有待回应/);
  assert.ok(game.cash > before);
  assert.ok(game.live.intent > 45);
  const current = game.cash;
  const summary = endLive(game);
  assert.equal(summary.round, 5);
  assert.equal(game.live, null);
  assert.equal(game.today.lives, 1);
  assert.equal(game.cash, current);
  assert.throws(() => endLive(game), /没有进行中/);
});

test('强硬或索礼回复会导致取关与观众离开', () => {
  const game = createGame(); startLive(game, constant(0.5));
  replyLive(game, 0, constant(0.5));
  const fans = game.fans, viewers = game.live.viewers;
  const result = replyLive(game, 2, constant(0.5));
  assert.ok(result.fans < 0);
  assert.ok(game.fans < fans);
  assert.ok(game.live.viewers < viewers);
  assert.ok(result.gifts > 0);
});

test('直播进行中不能发布或结算，避免直播收益跨日错记', () => {
  const game = createGame(); startLive(game);
  assert.throws(() => nextDay(game), /先结束直播/);
  assert.throws(() => publishVideo(game, config), /先结束/);
  endLive(game);
  assert.doesNotThrow(() => nextDay(game));
});

test('提前结束直播不会获得完整互动任务的奖励', () => {
  const game = createGame();
  startLive(game, constant(0.5));
  replyLive(game, 0, constant(0.5));
  endLive(game);
  assert.equal(game.today.lives, 0);
  assert.throws(() => claimTask(game, 'live'), /尚未完成/);
});

test('任务奖励不能重复领取，新的一天会重置领取状态', () => {
  const game = createGame();
  assert.throws(() => claimTask(game, 'video'), /尚未完成/);
  publishVideo(game, config, constant(0.5));
  const cash = game.cash;
  assert.equal(claimTask(game, 'video'), 120);
  assert.equal(game.cash, cash + 120);
  assert.throws(() => claimTask(game, 'video'), /已领取/);
  const report = nextDay(game, constant(0.5));
  assert.equal(report.day, 1);
  assert.ok(report.passiveViews > 0);
  assert.equal(game.day, 2);
  assert.equal(game.energy, 100);
  assert.deepEqual(game.claimed, []);
  assert.equal(game.today.videos, 0);
});

test('排名随玩家热度变化，能够到达第一名并记录最佳成绩', () => {
  const game = createGame();
  assert.equal(getRank(game), 9);
  assert.equal(getNextGoal(game).target, 8);
  game.heat = 2000000;
  nextDay(game, constant(0.5));
  assert.equal(getRank(game), 1);
  assert.equal(game.bestRank, 1);
  assert.equal(getNextGoal(game).achieved, true);
  assert.equal(getRankings(game).filter(r => r.mine).length, 1);
});

test('热点按游戏日期轮换，损坏或跨平台存档被拒绝', () => {
  assert.notEqual(getHotspots(1)[0].category, getHotspots(2)[0].category);
  const game = createGame();
  assert.equal(validateGame(game, 'bilibili'), false);
  for (const invalid of [{ ...game, cash: NaN }, { ...game, energy: 200 }, { ...game, day: -1 }, { ...game, videos: [{}] }, { ...game, history: [null] }, { ...game, live: {} }]) assert.equal(validateGame(invalid, 'douyin'), false);
});

test('连续运营 30 天，资金、能量、口碑和存档始终有效', () => {
  for (const platform of Object.keys(PLATFORMS)) {
    const game = createGame(platform);
    for (let day = 0; day < 30; day++) {
      publishVideo(game, { ...config, quality: game.cash >= 220 ? 'standard' : 'quick', topic: getHotspots(game.day)[0].category, strategy: day % 2 ? 'meme' : 'trend' }, constant(0.6));
      claimTask(game, 'video');
      startLive(game, constant(0.5));
      for (let round = 0; round < 5; round++) replyLive(game, round % 2, constant(0.5));
      endLive(game); claimTask(game, 'live'); nextDay(game, constant(0.5));
      assert.equal(validateGame(game, platform), true);
      assert.ok(game.cash >= 0);
      assert.ok(game.reputation >= 0 && game.reputation <= 100);
    }
    assert.ok(getRank(game) <= 3);
  }
});

test('趋势图来自真实作品和每日结算，末点与看板总量一致', () => {
  const game = createGame();
  assert.deepEqual(getTrendData(game, 7), [0, 0, 0, 15220, 43860, 86420, 86420]);
  publishVideo(game, config, constant(0.5));
  assert.equal(getTrendData(game, 7).at(-1), game.views);
  const endViews = game.views;
  nextDay(game, constant(0.5));
  assert.ok(getTrendData(game, 7).at(-2) >= endViews);
  assert.equal(getTrendData(game, 14, 'fans').at(-1), game.fans);
  assert.equal(getTrendData(game, 30).length, 30);
  for (let day = 0; day < 100; day++) nextDay(game, constant(0.5));
  assert.equal(getTrendData(game, 7).at(-2), game.history.at(-1).totalViews);
});
