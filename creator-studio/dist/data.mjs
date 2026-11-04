export const PLATFORMS = {
  douyin: {
    id: 'douyin', name: '抖音', brand: '抖音创作者中心', short: '抖音号', accent: '#fe2c55',
    tagline: '记录美好，也创造热爱', description: '短视频节奏快，热点和玩梗更容易破圈。',
    perks: ['热点流量 ×1.5', '直播礼物 ×1.3', '短平快更出圈'], weights: { quality: 0.65, trend: 1.5, meme: 1.3, gift: 1.3 },
    creators: ['陈翔六点半', '张同学', '刘畊宏', '多余和毛毛姐', '祝晓晗', '大狼狗郑建鹏&言真夫妇', '垫底辣孩', '唐艺'],
    sources: [{ title: '抖音创作者内容', url: 'https://www.douyin.com/hashtag/7461210570814195722' }],
  },
  bilibili: {
    id: 'bilibili', name: '哔哩哔哩', brand: 'bilibili 创作中心', short: 'UID', accent: '#00aeec',
    tagline: '你感兴趣的，都是你的舞台', description: '用内容积累信任，专业深度和社区共鸣同样重要。',
    perks: ['内容质量 ×1.5', '玩梗互动 ×1.4', '长线粉丝更稳定'], weights: { quality: 1.5, trend: 0.8, meme: 1.4, gift: 0.9 },
    creators: ['老番茄', '影视飓风', '老师好我叫何同学', '小潮院长', '木鱼水心', '某幻君', '绵羊料理', '逍遥散人'],
    sources: [{ title: 'B站百大创作者公开内容', url: 'https://www.bilibili.com/video/BV16K4y1B7qh/' }],
  },
  xiaohongshu: {
    id: 'xiaohongshu', name: '小红书', brand: '小红书创作服务平台', short: '小红书号', accent: '#ff2442',
    tagline: '让生活的灵感，被更多人看见', description: '审美、实用和真实分享，让一次收藏变成长期关注。',
    perks: ['生活美学 ×1.4', '实用内容 ×1.3', '信任带来关注'], weights: { quality: 1.15, trend: 1.1, meme: 0.65, gift: 1.1 },
    creators: ['董洁', '章小蕙', '深夜徐老师', '易梦玲', '张小狮', '千惠', '房琪kiki', '李子柒'],
    sources: [{ title: '小红书公开创作者资料', url: 'https://toobigdata.com/red/h/bf3477dafc498776a575b7ff7864f9d9/' }],
  },
};

export const TOPICS = [
  { id: 'life', name: '生活记录', icon: 'camera', desc: '把平凡的一天拍成故事', image: 'city', affinity: { douyin: 1.08, bilibili: 0.95, xiaohongshu: 1.4 } },
  { id: 'food', name: '美食探店', icon: 'coffee', desc: '人间烟火，快乐加倍', image: 'food', affinity: { douyin: 1.15, bilibili: 1.08, xiaohongshu: 1.25 } },
  { id: 'tech', name: '数码知识', icon: 'monitor', desc: '专业一点，认真一点', image: 'desk', affinity: { douyin: 0.9, bilibili: 1.45, xiaohongshu: 0.95 } },
  { id: 'game', name: '游戏娱乐', icon: 'game', desc: '快乐才是第一生产力', image: 'game', affinity: { douyin: 1.05, bilibili: 1.4, xiaohongshu: 0.8 } },
  { id: 'fashion', name: '穿搭美学', icon: 'sparkles', desc: '找到属于自己的风格', image: 'fashion', affinity: { douyin: 1.12, bilibili: 0.85, xiaohongshu: 1.45 } },
  { id: 'comedy', name: '搞笑整活', icon: 'smile', desc: '一些有趣的精神状态', image: 'cat', affinity: { douyin: 1.4, bilibili: 1.2, xiaohongshu: 0.95 } },
];

export const QUALITIES = [
  { id: 'quick', name: '随手记录', desc: '真实轻松，灵感即刻上线', cost: 60, energy: 15, factor: 0.62, quality: 35 },
  { id: 'standard', name: '用心制作', desc: '好内容与制作效率的平衡', cost: 220, energy: 30, factor: 1.05, quality: 70 },
  { id: 'premium', name: '精雕细琢', desc: '电影级投入，结果仍有惊喜', cost: 650, energy: 50, factor: 1.5, quality: 96 },
];
export const STRATEGIES = [
  { id: 'original', name: '真诚原创', desc: '慢慢积累信任与口碑', icon: 'heart', reputation: 4 },
  { id: 'trend', name: '追个热点', desc: '抓住流量窗口，可能一飞冲天', icon: 'flame', reputation: 0 },
  { id: 'meme', name: '玩梗整活', desc: '让观众的快乐来得更直接', icon: 'smile', reputation: 1 },
  { id: 'edge', name: '争议擦边', desc: '博眼球，也可能限流掉粉', icon: 'alert', reputation: -12 },
];
export const HOTSPOTS = [
  { title: '普通人的生活，也值得被记录', category: 'life', score: '982.6万', tag: '热', trend: '+32%', desc: '镜头里的真实感，正在获得更多关注。' },
  { title: '打工人的精神状态belike', category: 'comedy', score: '856.3万', tag: '新', trend: '+48%', desc: '接住这个梗，快乐比精致更有感染力。' },
  { title: '一口入秋的幸福感', category: 'food', score: '723.8万', tag: '', trend: '+21%', desc: '秋日食物与温暖色调，是今天的灵感。' },
  { title: '我的桌面改造计划', category: 'tech', score: '618.2万', tag: '', trend: '+18%', desc: '实用与审美的结合，收藏价值拉满。' },
  { title: '不费力的秋日穿搭', category: 'fashion', score: '542.1万', tag: '', trend: '+16%', desc: '舒服的穿搭，更容易收获共鸣。' },
  { title: '这个游戏也太上头了', category: 'game', score: '486.5万', tag: '', trend: '+12%', desc: '有趣的瞬间，值得被分享。' },
];

// 直播事件中的观众全部为虚构角色，与榜单创作者无关。
export const LIVE_EVENTS = [
  { user: '今天也要开心', color: '#f0aa63', badge: '新观众', text: '第一次刷到你！主播平时都拍些什么呀？',
    choices: [
      { text: '欢迎！我在记录生活里那些小小的快乐，你呢？', tone: '真诚欢迎', fans: 32, viewers: 24, gifts: 8, intent: 10, follow: 12, reputation: 1, result: '对方留下来聊天，更多新观众也点了关注。' },
      { text: '我拍什么不重要，先点个关注不迷路！', tone: '直接引导', fans: 13, viewers: -12, gifts: 0, intent: -5, follow: 3, reputation: 0, result: '一些观众点了关注，也有人觉得太着急而离开。' },
      { text: '来得正好！你们想看什么，我现场整一个。', tone: '邀请参与', fans: 21, viewers: 45, gifts: 12, intent: 16, follow: 6, reputation: 0, result: '弹幕开始刷起选题，观众的互动意愿明显上升。' },
    ] },
  { user: '一只小橘子', color: '#ff9b81', badge: '粉丝', text: '认真做的视频没多少人看，随手一拍却爆了，好真实啊。',
    choices: [
      { text: '是啊，运气也有戏份。但有人喜欢，就值得继续。', tone: '坦诚交流', fans: 40, viewers: 22, gifts: 28, intent: 9, follow: 10, reputation: 2, result: '你的坦诚引发共鸣，老粉送来了小礼物。' },
      { text: '那当然，流量密码已经被我拿捏了！', tone: '自信玩梗', fans: 25, viewers: 36, gifts: 12, intent: 12, follow: 4, reputation: 0, result: '观众被逗笑了，弹幕气氛更热闹。' },
      { text: '别聊这个了，礼物刷起来我再讲。', tone: '礼物优先', fans: -18, viewers: -43, gifts: 45, intent: -12, follow: -9, reputation: -3, result: '收到了礼物，但一些观众觉得被忽视，选择取关离开。' },
    ] },
  { user: '路过的阿白', color: '#8cafff', badge: '路人', text: '感觉你的视频也没什么特别的，怎么还有人看？',
    choices: [
      { text: '可能大家刚好也喜欢这些普通日子吧，欢迎提建议。', tone: '温和回应', fans: 35, viewers: 18, gifts: 20, intent: 7, follow: 11, reputation: 3, result: '友善的回应让观望的观众愿意留下，也赢得了关注。' },
      { text: '主打一个特别普通，普通得很特别。', tone: '幽默化解', fans: 29, viewers: 38, gifts: 15, intent: 14, follow: 5, reputation: 1, result: '弹幕满屏哈哈哈，原本冷清的直播间活跃了起来。' },
      { text: '不爱看就走，没人留你。', tone: '正面回怼', fans: -24, viewers: -65, gifts: 6, intent: -10, follow: -14, reputation: -4, result: '冲突劝退了部分观众，直播间停留人数下降。' },
    ] },
  { user: '晚风收藏家', color: '#b29be9', badge: '老粉', text: '从你第一条作品就关注了，加油呀！送你一颗小心心～',
    choices: [
      { text: '原来你一直都在！谢谢陪伴，记住你的名字了。', tone: '记住陪伴', fans: 48, viewers: 20, gifts: 66, intent: 12, follow: 14, reputation: 2, result: '老粉很感动，连带新观众也被这份温暖打动。' },
      { text: '小心心收到！给大家表演一个我的保留节目。', tone: '回馈观众', fans: 32, viewers: 55, gifts: 40, intent: 18, follow: 7, reputation: 1, result: '节目效果拉满，观众纷纷留下来继续互动。' },
      { text: '谢谢，大家都向这位朋友学习，礼物不要停。', tone: '继续索礼', fans: -8, viewers: -24, gifts: 78, intent: -8, follow: -6, reputation: -2, result: '礼物增加了，但部分老粉的关注意愿降低。' },
    ] },
  { user: '凌晨两点半', color: '#7bb6a1', badge: '新观众', text: '关注了！下次直播什么时候？想和你继续聊。',
    choices: [
      { text: '我会在动态里提前告诉大家，我们下次见！', tone: '认真约定', fans: 46, viewers: 25, gifts: 24, intent: 8, follow: 15, reputation: 2, result: '认真回应带来了新的期待，观众愿意持续关注。' },
      { text: '你们在我就多聊一会儿，来聊点有意思的！', tone: '延续互动', fans: 30, viewers: 48, gifts: 32, intent: 17, follow: 7, reputation: 0, result: '观众的参与感上升，直播间又热闹了一波。' },
      { text: '看心情吧，下次记得带礼物来。', tone: '随性回应', fans: -12, viewers: -36, gifts: 18, intent: -7, follow: -10, reputation: -2, result: '部分观众有些失望，悄悄离开了直播间。' },
    ] },
];

export const SEED_VIDEOS = [
  { id: 'seed-1', title: '原来，认真生活就是最好的文案', topic: 'life', image: 'city', views: 42560, likes: 3862, fans: 268, revenue: 126.8, quality: 'standard', strategy: 'original', status: '推荐中', day: 0, retention: 63, heat: 8800 },
  { id: 'seed-2', title: '一家藏在巷子里的宝藏小店', topic: 'food', image: 'food', views: 28640, likes: 2645, fans: 174, revenue: 86.4, quality: 'standard', strategy: 'trend', status: '已发布', day: -1, retention: 56, heat: 6300 },
  { id: 'seed-3', title: '周末不赶路，去感受路', topic: 'life', image: 'travel', views: 15220, likes: 1235, fans: 88, revenue: 55.3, quality: 'quick', strategy: 'original', status: '已发布', day: -2, retention: 49, heat: 2900 },
];
