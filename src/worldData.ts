import type { Stats } from './types'
import { asset } from './utils/assets'

export type LocationId = 'dorm' | 'makeup' | 'practice' | 'studio'

export interface LocationData {
  id: LocationId
  name: string
  icon: string
  scene: string
  hint: string
}

export interface NpcEvent {
  id: string
  name: string
  title: string
  location: LocationId
  portrait: string
  minWeek: number
  lines: string[]
  choices: NpcChoice[]
}

export interface NpcChoice {
  label: string
  reply: string
  reward: Partial<Stats>
  result: string
}

const WEEK_REPLIES = [
  '先别急，本公主第一周也能把事故走成红毯。',
  '分组而已，谁是中心镜头自己会认。',
  '恶剪想困住我？泥看我怎么把黑热搜盘活。',
  '纽祜禄氏都来了，那就让她见识点本质。',
  '半决赛不能隐身，本公主今天必须开大。',
  '最后一夜惹，泥说的每句话我都记着。',
]

const WEEK_CLOSERS = [
  '行，第一周先把路人盘成骑士。',
  '懂惹，这周抢的不是段落，是命运。',
  '那我等着看泥把恶剪剪回去。',
  '好癫，我已经闻到热搜的味道惹。',
  '半决赛就照这个路子狠狠干。',
  '成团夜见，别让本质掉地上噜。',
]

const NPC_WEEKLY: Record<string, Array<{ hook: string; options: [string, string] }>> = {
  'fan-data': [
    { hook: '泥的初舞台直拍刚放出，评论区还在观望噜。', options: ['发原片证明颜艺', '先做魔性表情包'] },
    { hook: '分组镜头太碎，站子首页该押哪一段？', options: ['主推旋转高光', '主推没抢到词也很拽'] },
    { hook: '恶剪上热搜了，骑士们现在气到劈叉！', options: ['连夜剪澄清 CUT', '先发虐粉长图'] },
    { hook: '对家应援铺满广场，我们要不要正面刚？', options: ['灯牌狠狠干回去', '憋个反转数据图'] },
    { hook: '半决赛路人盘来了，大家都在问泥是谁。', options: ['投放一字马神图', '安利舞台全能合集'] },
    { hook: '成团夜只差最后一口气，骑士全员待命！', options: ['全网投票冲顶', '守住直播实时控评'] },
  ],
  'green-tea': [
    { hook: '姐姐衣服脏了也好看，不像我只能靠干净噜。', options: ['笑着借她外套改造', '回她一句泥好贴心'] },
    { hook: '副歌好难哦，要不姐姐把中心让给我？', options: ['陪她夹音抢回来', '让段落但抢走结尾动作'] },
    { hook: '网上都骂泥，我真的心疼到吃不下沙拉。', options: ['请她直播替我澄清', '反问她怎么吃了两碗'] },
    { hook: '纽祜禄氏好凶，我只敢躲在姐姐身后呢。', options: ['拉她一起正面迎战', '让她去当双面传话筒'] },
    { hook: '造型师只剩一个，姐姐应该不会跟我抢吧？', options: ['合作做双生造型', '先下手拿走化妆箱'] },
    { hook: '成团位好少，人家只想和姐姐一起出道。', options: ['营业最后一支双人舞', '微笑告诉她名额归我'] },
  ],
  'lotus-mirror': [
    { hook: '姐姐衣服弄脏了，人家真的不是故意看笑话。', options: ['借她镜子现场改造', '学她无辜脸反客为主'] },
    { hook: '我唱副歌会不会太抢镜？姐姐别生气哦。', options: ['关滤镜公平比一次', '偷学她的泪光角度'] },
    { hook: '导演说那些黑料不是我递的，泥信我吧？', options: ['盯着她沉默十秒', '套出递料的时间线'] },
    { hook: '纽祜禄氏说要撕泥，我听了都替泥害怕。', options: ['请她现场站队', '借她的柔弱反杀对家'] },
    { hook: '没有造型师好惨，我这里刚好多一套妆。', options: ['交换化妆技巧', '只借口红自己发挥'] },
    { hook: '今晚无论谁出道，我们都是好姐妹对吧？', options: ['合照留下体面', '提醒她镜头正在直播'] },
  ],
  'paparazzi-tip': [
    { hook: '我拍到泥后台改衣服，想走时尚线还是发疯线？', options: ['放出改造全过程', '只发最后惊艳成片'] },
    { hook: '抢泥副歌那位，昨晚偷偷练了八遍假唱。', options: ['把证据留到舞台后', '现在就放预告吊胃口'] },
    { hook: '恶剪原片我有一份，价钱嘛，看泥诚意。', options: ['拿独家采访交换', '用淋语把价格砍半'] },
    { hook: '纽祜禄氏彩排翻车的瓜，保熟又多汁。', options: ['压住瓜专注舞台', '只放一秒引爆讨论'] },
    { hook: '买断造型师的人我拍到了，要不要见光？', options: ['公开交易现场', '拿证据换回造型师'] },
    { hook: '败者联盟准备在成团夜搞事，我全拍下来了。', options: ['直播前先放风', '等她们发作再反杀'] },
  ],
  'senior-beat': [
    { hook: '七十二变别顾着变，第一拍先给我站稳。', options: ['慢速数拍练基础', '保留一个夸张劈叉点'] },
    { hook: '少男杀手不是乱杀，重拍要像刀落下去。', options: ['专练重拍爆发', '把副歌动作做成记忆点'] },
    { hook: '白眼翻天拍子刁，泥一急就会抢半拍。', options: ['关镜子只听底鼓', '边翻白眼边稳住脚步'] },
    { hook: '大阴阳师要收着跳，阴阳怪气也得留气口。', options: ['练停顿和呼吸', '强化突然定格反差'] },
    { hook: '美丽极限速度快，动作小了镜头吃不到。', options: ['加大动作幅度', '减少动作换稳定连击'] },
    { hook: '塑料王冠最后一战，体力必须留到结尾。', options: ['重排体力分配', '结尾追加终极大劈叉'] },
  ],
  'rival-battle': [
    { hook: '初舞台就这点动作？泥的七十二变只变了发型吧。', options: ['现场多转三圈', '回她泥连发型都没变'] },
    { hook: '副歌都抢不到，少男看见泥只会逃跑噜。', options: ['用舞蹈中心反杀', '用一句淋语让她闭麦'] },
    { hook: '全网都在骂泥，今天还敢来练习室？', options: ['开直播练给全网看', '关门狠狠干到凌晨'] },
    { hook: '纽祜禄氏约的是泥，先打赢我再说吧。', options: ['来一轮即兴斗舞', '让她先读懂淋语再来'] },
    { hook: '没造型师就退赛，别穿睡衣来半决赛。', options: ['把训练服改成高定', '借她礼服反客为主'] },
    { hook: '今晚王冠归我，泥最多拿个塑料袋。', options: ['舞台上用实力回答', '先送她一句提前退赛快乐'] },
  ],
  'director-camera': [
    { hook: '初舞台只有十五秒特写，泥打算怎么活下来？', options: ['用表情连变抢镜', '把最强动作留给特写'] },
    { hook: '分组戏不够抓马，要不要我给泥加点冲突？', options: ['靠实力制造反差', '接受一段口语互撕'] },
    { hook: '恶剪也是剪，能上热搜就是本事，懂不懂？', options: ['要求放出完整舞台', '顺势录一段反黑采访'] },
    { hook: '1V1镜头很贵，泥要温柔还是发疯？', options: ['前半温柔后半发疯', '从第一秒疯到结尾'] },
    { hook: '半决赛广告很多，泥的高光可能被切碎。', options: ['设计短促爆点动作', '争取一镜到底版本'] },
    { hook: '成团夜全程直播，翻车可没有重录。', options: ['保守稳住全场', '赌一把终极高难动作'] },
  ],
  'capital-test': [
    { hook: '初舞台数据一般，我们需要一个更好卖的人设。', options: ['坚持素人逆袭本质', '包装成发疯甜心'] },
    { hook: '组队资源有限，听话的人才有中心镜头。', options: ['拿结果换镜头', '先拿资源再改剧本'] },
    { hook: '黑红也是红，我们准备继续投放争议话题。', options: ['要求同步实力物料', '接受黑红但锁定澄清权'] },
    { hook: '对家背后也有资本，泥要不要暂时低头？', options: ['正面硬刚不低头', '表面握手暗中超车'] },
    { hook: '半决赛只保一个人，泥拿什么证明值得？', options: ['拿舞台完成度说话', '拿粉丝转化数据说话'] },
    { hook: '王冠可以给泥，但之后的合约必须听安排。', options: ['先看清每一条合约', '拒绝王冠也不卖本质'] },
  ],
}

export function getNpcWeekContent(event: NpcEvent, week: number): { lines: string[]; choices: NpcChoice[] } {
  const index = Math.max(0, Math.min(5, week - 1))
  const variant = NPC_WEEKLY[event.id]?.[index]
  if (!variant) return { lines: event.lines, choices: event.choices }
  return {
    lines: [`${event.name}：${variant.hook}`, `主角：${WEEK_REPLIES[index]}`, `${event.name}：${WEEK_CLOSERS[index]}`],
    choices: event.choices.map((choice, choiceIndex) => ({
      ...choice,
      label: variant.options[choiceIndex],
      reply: `主角：${variant.options[choiceIndex]}，就这么办噜。`,
      result: `${choice.result}（本周事件已改变。）`,
    })),
  }
}

export const locations: LocationData[] = [
  { id: 'dorm', name: '选手宿舍', icon: '⌂', scene: asset('assets/scenes/dorm.webp'), hint: '瓜最多的地方，睡觉只是装饰。' },
  { id: 'makeup', name: '化妆间', icon: '✦', scene: asset('assets/scenes/makeup.webp'), hint: '脸要美，话也要有本质。' },
  { id: 'practice', name: '练习室', icon: '♫', scene: asset('assets/scenes/practice.webp'), hint: '地板不冒烟，说明还没练够。' },
  { id: 'studio', name: '录制大厅', icon: '◉', scene: asset('assets/scenes/stage1.webp'), hint: '镜头一开，谁糊谁知道。' },
]

export const npcEvents: NpcEvent[] = [
  {
    id: 'fan-data', name: '粉头站姐', title: '本质数据女工', location: 'dorm', minWeek: 1,
    portrait: asset('assets/characters/fan.webp'),
    lines: ['站姐：泥昨晚直拍涨得像发面馒头！', '主角：别光夸，控评做了没？', '站姐：做惹！黑评已经美美隐身噜。'],
    choices: [
      { label: '给站姐比个本质爱心', reply: '主角：辛苦惹，今晚给泥独家饭拍角度！', reward: { fans: 10 }, result: '站姐连夜做图，死忠骑士猛猛增加！' },
      { label: '让她先去睡觉', reply: '主角：数据要做，命也得要，给我睡！', reward: { lin: 4, fans: 4 }, result: '泥意外收获“最会疼粉”热搜。' },
    ],
  },
  {
    id: 'green-tea', name: '绿茶营业姐', title: '人间小夹子', location: 'dorm', minWeek: 1,
    portrait: asset('assets/characters/green-tea.webp'),
    lines: ['营业姐：宝宝别误会，我只是天生站 C 位。', '主角：泥不是天生，泥是硬挤。', '营业姐：哎呀，被泥看穿惹，别说出去噜。'],
    choices: [
      { label: '陪她夹回去', reply: '主角：宝宝泥说得对噜，可惜 C 位认脸。', reward: { lin: 8 }, result: '夹子对决，泥的淋语更丝滑惹。' },
      { label: '拉她一起营业', reply: '主角：别挤惹，来拍个双人挑战。', reward: { fans: 7, looks: 3 }, result: '塑料姐妹花营业意外爆了。' },
    ],
  },
  {
    id: 'lotus-mirror', name: '清纯白莲姐', title: '无辜脸大师', location: 'makeup', minWeek: 1,
    portrait: asset('assets/characters/lotus.webp'),
    lines: ['白莲姐：姐姐，我素颜是不是太抢镜惹？', '主角：没事，滤镜关了泥就老实了。', '白莲姐：泥讲话好伤人家，可是好本质。'],
    choices: [
      { label: '现场关掉她的滤镜', reply: '主角：来，本公主帮泥返璞归真。', reward: { lin: 7 }, result: '白莲沉默了，泥的淋力更锋利。' },
      { label: '偷学她的无辜脸', reply: '主角：这个眼神不错，本公主征用了。', reward: { looks: 8 }, result: '泥解锁了三秒落泪颜艺。' },
    ],
  },
  {
    id: 'paparazzi-tip', name: '狗仔', title: '瓜田特派员', location: 'makeup', minWeek: 1,
    portrait: asset('assets/characters/paparazzi.webp'),
    lines: ['狗仔：有个大瓜，泥想听不？', '主角：先说保不保熟，本公主不吃馊瓜。', '狗仔：保熟！对家假睫毛都是租的。'],
    choices: [
      { label: '拿瓜换一个热搜', reply: '主角：瓜泥留着，标题写本公主闭嘴惊艳。', reward: { fans: 9 }, result: '狗仔很懂事，热搜美美起飞。' },
      { label: '把瓜记进淋语素材库', reply: '主角：不急，关键时候再让她隐身。', reward: { lin: 9 }, result: '泥攒下一枚精准爆梗。' },
    ],
  },
  {
    id: 'senior-beat', name: '乐坛前辈', title: '节拍老艺术家', location: 'practice', minWeek: 1,
    portrait: asset('assets/characters/senior.webp'),
    lines: ['前辈：别追着音符跑，先听底鼓，懂？', '主角：懂惹，耳朵先劈叉，手再闭嘴惊艳。', '前辈：虽然听不懂，但泥拍子终于稳了。'],
    choices: [
      { label: '老实跟着底鼓练', reply: '主角：今天先不劈叉，先把拍子吃透。', reward: { skill: 10 }, result: '前辈亲自数拍，泥的脚终于不抢拍了！' },
      { label: '把动作改得更癫', reply: '主角：稳可以，平淡不可以，本公主要转飞。', reward: { skill: 6, looks: 4 }, result: '动作又稳又疯，镜头感拉满。' },
    ],
  },
  {
    id: 'rival-battle', name: '疯批话题王', title: '热搜常驻户', location: 'practice', minWeek: 1,
    portrait: asset('assets/characters/rival.webp'),
    lines: ['话题王：泥练这么久，还是给我当伴舞吧。', '主角：泥先把气喘匀了再来碰瓷噜。', '话题王：啊啊啊！泥等着上热搜！'],
    choices: [
      { label: '当场加练一轮', reply: '主角：泥先歇着，看本公主再来八遍。', reward: { skill: 10 }, result: '地板冒烟，对家看傻惹。' },
      { label: '回敬一句淋语', reply: '主角：泥的实力跟泥的气息一样，散得好快。', reward: { lin: 10 }, result: '对家破防冲出练习室。' },
    ],
  },
  {
    id: 'director-camera', name: '节目总导演', title: '镜头生杀大权', location: 'studio', minWeek: 1,
    portrait: asset('assets/characters/director.webp'),
    lines: ['导演：镜头来了，泥怎么还不哭？', '主角：本公主只负责让别人哭。', '导演：好癫，好有话题，给泥一个特写！'],
    choices: [
      { label: '对镜头缓缓翻白眼', reply: '主角：哭没有，白眼管够。', reward: { looks: 9 }, result: '这个白眼被剪成全网神图。' },
      { label: '突然感谢本质骑士', reply: '主角：没有骑士，就没有今天发癫的我。', reward: { fans: 10 }, result: '粉丝哭着开始新一轮打投。' },
    ],
  },
  {
    id: 'capital-test', name: '资本集团', title: '看不见脸的金主', location: 'studio', minWeek: 1,
    portrait: asset('assets/characters/capital.webp'),
    lines: ['资本：我们只捧听话的人。', '主角：那泥们今天算是捧错人惹。', '资本：……有个性。数据还不错，继续投。'],
    choices: [
      { label: '拒绝被安排', reply: '主角：剧本泥留着，本公主自己写结局。', reward: { lin: 12 }, result: '资本被说沉默，竟然更想押注泥。' },
      { label: '先拿资源再说', reply: '主角：听话可以，先把首页横幅给我。', reward: { fans: 10, looks: 4 }, result: '资源到账，全网都看见泥的脸。' },
    ],
  },
]

export const statLabels: Record<keyof Stats, string> = {
  looks: '颜艺值', skill: '舞力值', lin: '淋力值', fans: '粉丝值',
}
