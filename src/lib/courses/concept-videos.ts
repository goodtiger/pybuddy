import type { Lesson } from '@/types/lesson';

export interface ConceptVideo {
  title: string;
  concept: string;
  metaphor: string;
  takeaway: string;
  sourceName?: string;
  sourceUrl?: string;
  embedUrl?: string;
  question: string;
  answer: string;
}

function bilibiliEmbedUrl(bvid: string, page: number) {
  const params = new URLSearchParams({
    bvid,
    page: String(page),
    autoplay: '0',
    high_quality: '1',
  });

  return `https://player.bilibili.com/player.html?${params.toString()}`;
}

const PROGRAMMING_BASICS: ConceptVideo = {
  title: '什么是编程？',
  concept: '编程就是给电脑一步一步的指令。',
  metaphor: '像给小海龟一张寻宝路线图：先走一步，再转弯，再说一句话。',
  takeaway: 'Python 会按顺序读你的代码，所以第一步要写清楚。',
  sourceName: 'Bilibili · Python少儿教程',
  sourceUrl: 'https://www.bilibili.com/video/BV1Qy4y1T77U/',
  embedUrl: bilibiliEmbedUrl('BV1Qy4y1T77U', 3),
  question: '代码最像下面哪个东西？',
  answer: '一步一步的路线图',
};

const PRINT_CONCEPT: ConceptVideo = {
  title: 'print 像小喇叭',
  concept: 'print() 会把括号里的内容说出来。',
  metaphor: '把文字放进小喇叭，Python 就会在输出舞台喊出来。',
  takeaway: '想看到文字结果，就用 print("想说的话")。',
  sourceName: 'Bilibili · Python少儿编程入门',
  sourceUrl: 'https://www.bilibili.com/video/BV1S4411272Y/',
  embedUrl: bilibiliEmbedUrl('BV1S4411272Y', 5),
  question: '想让 Python 说“你好”，应该先找哪个魔法？',
  answer: 'print 小喇叭',
};

const VARIABLE_CONCEPT: ConceptVideo = {
  title: '变量像贴标签的小盒子',
  concept: '变量可以把名字、数字或颜色先保存起来。',
  metaphor: '给盒子贴上 name 标签，盒子里放“小海龟”，之后看到 name 就知道拿这盒。',
  takeaway: '变量名在左边，盒子里的内容在右边：name = "小海龟"。',
  sourceName: 'Bilibili · Python少儿编程入门',
  sourceUrl: 'https://www.bilibili.com/video/BV1S4411272Y/',
  embedUrl: bilibiliEmbedUrl('BV1S4411272Y', 10),
  question: '变量最像什么？',
  answer: '贴了标签的小盒子',
};

const TURTLE_MOTION: ConceptVideo = {
  title: '小海龟听命令移动',
  concept: '前进、后退、左转、右转都是给小海龟的动作指令。',
  metaphor: '像遥控小车：按前进就往前，按右转就换方向。',
  takeaway: '画图时要先导入 turtle，再让小海龟一步一步移动。',
  sourceName: 'Bilibili · Python少儿教程 Turtle',
  sourceUrl: 'https://www.bilibili.com/video/BV1Qy4y1T77U/',
  embedUrl: bilibiliEmbedUrl('BV1Qy4y1T77U', 7),
  question: '如果想画一条线，先让小海龟做什么？',
  answer: '向前走',
};

const LOOP_CONCEPT: ConceptVideo = {
  title: '循环像小复印机',
  concept: '循环会把同一组动作重复很多次。',
  metaphor: '如果要画正方形，不用写四遍前进和右转，可以让小复印机重复 4 次。',
  takeaway: 'for i in range(4) 表示把里面缩进的代码重复 4 次。',
  sourceName: 'Bilibili · Python少儿教程',
  sourceUrl: 'https://www.bilibili.com/video/BV1Qy4y1T77U/',
  embedUrl: bilibiliEmbedUrl('BV1Qy4y1T77U', 21),
  question: '循环最擅长帮我们做什么？',
  answer: '重复动作',
};

export function getConceptVideoForLesson(lesson: Lesson): ConceptVideo {
  const availableBlocks = new Set(lesson.blocks.available);
  const code = lesson.expected_code.toLowerCase();

  if (code.includes('for ') || code.includes('range') || availableBlocks.has('repeat_square')) {
    return LOOP_CONCEPT;
  }

  if (code.includes('turtle') || lesson.visual.type === 'turtle_canvas') {
    return TURTLE_MOTION;
  }

  if (availableBlocks.has('variable') || code.includes('=')) {
    return VARIABLE_CONCEPT;
  }

  if (code.includes('print')) {
    return PRINT_CONCEPT;
  }

  return PROGRAMMING_BASICS;
}
