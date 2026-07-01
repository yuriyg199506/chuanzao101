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
    id: 'green-tea', name: '绿茶营业姐', title: '人间小夹子', location: 'dorm', minWeek: 2,
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
    id: 'paparazzi-tip', name: '狗仔', title: '瓜田特派员', location: 'makeup', minWeek: 3,
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
    id: 'rival-battle', name: '疯批话题王', title: '热搜常驻户', location: 'practice', minWeek: 4,
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
    id: 'capital-test', name: '资本集团', title: '看不见脸的金主', location: 'studio', minWeek: 5,
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
