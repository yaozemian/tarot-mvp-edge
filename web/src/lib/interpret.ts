import type { DrawnCard } from "../types/tarot";

const positionLabels: Record<string, string> = {
  past: "过去",
  present: "现在",
  future: "未来",
};

const orientationLabels: Record<string, string> = {
  upright: "正位",
  reversed: "逆位",
};

type Topic =
  | "love"
  | "career"
  | "money"
  | "study"
  | "relationship"
  | "choice"
  | "general";

type TopicConfig = {
  actionNoun: string;
  advice: string;
  lens: string;
  risk: string;
};

const topicConfigs: Record<Topic, TopicConfig> = {
  love: {
    actionNoun: "关系推进",
    advice: "先把自己的期待说清楚，再观察对方是否有稳定回应；不要只靠猜测来填补不确定。",
    lens: "情感回应、投入程度和边界",
    risk: "把短暂情绪误当成长期承诺",
  },
  career: {
    actionNoun: "职业推进",
    advice: "把目标拆成一个可验证的小动作：投递、沟通、补作品集、确认时间线，先拿到现实反馈。",
    lens: "机会匹配、准备程度和执行节奏",
    risk: "把焦虑当成结论，或者在信息不足时过早否定自己",
  },
  money: {
    actionNoun: "资源安排",
    advice: "先确认底线预算和可承受风险，再决定要保守、调整还是投入。",
    lens: "安全感、现金流和资源分配",
    risk: "为了摆脱压力而做出过快的金钱决定",
  },
  study: {
    actionNoun: "学习推进",
    advice: "先补最影响结果的一块短板，并给自己设置一个能在三天内完成的检查点。",
    lens: "专注度、阶段目标和真实准备度",
    risk: "用担心结果替代具体复习或实践",
  },
  relationship: {
    actionNoun: "关系沟通",
    advice: "先把最容易误解的一句话讲清楚，再判断这段互动是否值得继续投入。",
    lens: "互动模式、表达方式和边界感",
    risk: "反复消耗在谁对谁错，而没有处理真正的问题",
  },
  choice: {
    actionNoun: "选择判断",
    advice: "把每个选项的收益、代价和最坏情况写下来，选择你愿意承担代价的那一边。",
    lens: "优先级、机会成本和可承受风险",
    risk: "寻找完全没有风险的答案，导致一直停在原地",
  },
  general: {
    actionNoun: "当前问题",
    advice: "先把问题缩小到一件能处理的事，再给自己一点观察时间，不急着下最终结论。",
    lens: "现实处境、情绪状态和下一步动作",
    risk: "把复杂感受混在一起，导致真正该处理的点被盖住",
  },
};

export function createLocalInterpretation(question: string, cards: DrawnCard[]) {
  const topic = detectTopic(question);
  const config = topicConfigs[topic];
  const insights = cards.map((item) => describeCardForQuestion(item, topic, question));
  const present = insights.find((item) => item.position === "present") ?? insights[1];
  const future = insights.find((item) => item.position === "future") ?? insights[2];

  const summary = [
    `关于“${question}”，这次重点不是泛泛看运气，而是看${config.lens}。`,
    `${present.cardName}${orientationLabels[present.orientation]}提示当前最卡的是${present.issue}`,
    `${future.cardName}${orientationLabels[future.orientation]}给出的方向是${future.nextStep}`,
  ].join("");

  const fullText =
    `1. 问题核心\n` +
    `你问的是“${question}”。这更像是在判断${config.actionNoun}是否已经到位：一边是你想往前走，另一边是现实准备、信息反馈或心理状态还需要确认。这里最大的风险是${config.risk}。\n\n` +
    `2. 单牌解析\n` +
    insights
      .map(
        (item) =>
          `${positionLabels[item.position]}：${item.cardName}（${orientationLabels[item.orientation]}）\n${item.text}`,
      )
      .join("\n\n") +
    `\n\n3. 牌阵合读\n${buildSpreadReading(insights, config)}\n\n` +
    `4. 下一步建议\n${config.advice} ${buildClosingAdvice(cards, topic)}`;

  return { fullText, summary };
}

function detectTopic(question: string): Topic {
  const text = question.toLowerCase();

  if (hasAny(text, ["喜欢", "恋爱", "感情", "对象", "前任", "暧昧", "结婚", "分手"])) {
    return "love";
  }

  if (
    hasAny(text, [
      "工作",
      "离职",
      "辞职",
      "跳槽",
      "面试",
      "职场",
      "项目",
      "产品",
      "公司",
      "老板",
      "offer",
      "升职",
      "创业",
      "实习",
      "暑期",
    ])
  ) {
    return "career";
  }

  if (hasAny(text, ["钱", "收入", "财务", "投资", "存款", "花销", "副业"])) {
    return "money";
  }

  if (hasAny(text, ["考试", "学习", "上岸", "考研", "作业", "学校", "成绩", "复习"])) {
    return "study";
  }

  if (hasAny(text, ["朋友", "家人", "同事", "相处", "关系", "沟通", "误会"])) {
    return "relationship";
  }

  if (hasAny(text, ["要不要", "该不该", "选择", "决定", "两份", "哪个", "是否"])) {
    return "choice";
  }

  return "general";
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function describeCardForQuestion(card: DrawnCard, topic: Topic, question: string) {
  const baseMeaning =
    card.orientation === "upright"
      ? card.card.meanings.upright
      : card.card.meanings.reversed;
  const topicSentence = buildTopicSentence(card.position, topic, card.orientation);
  const issue = buildIssue(card, topic);
  const nextStep = buildNextStep(card, topic);

  return {
    cardName: card.card.zhName,
    issue,
    nextStep,
    orientation: card.orientation,
    position: card.position,
    text: `${baseMeaning} 放在${positionLabels[card.position]}位置，放到“${question}”里看，${topicSentence}`,
  };
}

function buildTopicSentence(
  position: DrawnCard["position"],
  topic: Topic,
  orientation: DrawnCard["orientation"],
) {
  const push =
    orientation === "upright"
      ? "这部分可以作为你的助力。"
      : "这部分需要先修正，否则会拖慢判断。";

  const map: Record<Topic, Record<DrawnCard["position"], string>> = {
    love: {
      past: `过去的相处经验正在影响你对回应的解读，${push}`,
      present: `当前最重要的是看清真实期待，而不是只看对方一时的态度，${push}`,
      future: `后续会更依赖表达和边界，而不是单方面等待，${push}`,
    },
    career: {
      past: `之前的积累并没有白费，但它需要转成能被看见的作品、履历或行动，${push}`,
      present: `当下关键是把想法落到申请、沟通、准备材料这类具体动作，${push}`,
      future: `接下来要靠持续投入和复盘，而不是一次性冲刺决定结果，${push}`,
    },
    money: {
      past: `过去对安全感的需求仍在影响你现在的判断，${push}`,
      present: `当前要先看清现金流和实际压力，${push}`,
      future: `之后更适合用分阶段投入来降低不确定，${push}`,
    },
    study: {
      past: `之前的学习习惯仍在影响效率，${push}`,
      present: `现在要先找出最影响结果的短板，${push}`,
      future: `后面靠稳定练习和反馈修正来拉开差距，${push}`,
    },
    relationship: {
      past: `过去的互动模式还在延续，${push}`,
      present: `当前重点是把误解和边界讲清楚，${push}`,
      future: `后续关系会因为沟通方式而改变，${push}`,
    },
    choice: {
      past: `过去做选择的方式还在影响你，${push}`,
      present: `现在要分清想要、害怕和现实条件，${push}`,
      future: `未来结果取决于你是否接受选择必然有代价，${push}`,
    },
    general: {
      past: `过去的经验仍在影响你对这件事的反应，${push}`,
      present: `现在要把注意力放回最具体的现实处境，${push}`,
      future: `后续会随着行动和反馈逐渐清楚，${push}`,
    },
  };

  return map[topic][position];
}

function buildIssue(card: DrawnCard, topic: Topic) {
  const reversed = card.orientation === "reversed";
  const cardName = card.card.zhName;

  if (topic === "career") {
    return reversed ? "准备、信息或节奏还没对齐" : `${cardName}代表的优势需要被具体呈现`;
  }

  if (topic === "study") {
    return reversed ? "学习节奏容易被焦虑打断" : `${cardName}显示已有可用的基础或动力`;
  }

  if (topic === "love" || topic === "relationship") {
    return reversed ? "期待和表达之间有错位" : `${cardName}显示关系里仍有可沟通的空间`;
  }

  return reversed ? "某个关键条件还没稳定" : `${cardName}这股力量可以被你使用`;
}

function buildNextStep(card: DrawnCard, topic: Topic) {
  const reversed = card.orientation === "reversed";

  if (topic === "career") {
    return reversed ? "先补准备缺口，再推进申请或沟通" : "把优势转成可展示的行动成果";
  }

  if (topic === "study") {
    return reversed ? "先恢复节奏，再追求结果" : "把已有基础继续做扎实";
  }

  if (topic === "choice") {
    return reversed ? "先排除不愿承担的代价" : "选择更能长期承受的一边";
  }

  return reversed ? "先修正卡住的部分" : "顺着已经出现的机会继续推进";
}

function buildSpreadReading(
  insights: Array<{
    cardName: string;
    issue: string;
    nextStep: string;
    orientation: DrawnCard["orientation"];
    position: DrawnCard["position"];
  }>,
  config: TopicConfig,
) {
  const past = insights.find((item) => item.position === "past") ?? insights[0];
  const present = insights.find((item) => item.position === "present") ?? insights[1];
  const future = insights.find((item) => item.position === "future") ?? insights[2];
  const reversedCount = insights.filter((item) => item.orientation === "reversed").length;
  const pressure =
    reversedCount >= 2
      ? "牌阵里的阻力比较明显，适合先校准条件。"
      : reversedCount === 1
        ? "牌阵不是完全停滞，而是有一个关键点需要调整。"
        : "牌阵整体顺畅，重点是把机会落实。";

  return `${past.cardName}说明过去留下的影响是${past.issue}；${present.cardName}把焦点推到现在的${present.issue}；${future.cardName}给出的后续方向是${future.nextStep}。${pressure}这组牌的重点落在${config.lens}，不是简单说好或不好。`;
}

function buildClosingAdvice(cards: DrawnCard[], topic: Topic) {
  const reversedCount = cards.filter((item) => item.orientation === "reversed").length;

  if (topic === "career") {
    return reversedCount >= 2
      ? "先不要急着用一次结果定义自己，优先补作品、简历、沟通对象或申请节奏。"
      : "可以主动推进，但每一步都要留下可检查的结果。";
  }

  if (topic === "study") {
    return "把目标拆到今天就能完成的一小块，会比反复担心最终结果更有用。";
  }

  if (reversedCount >= 2) {
    return "现在更适合先整理条件，再做大的推进。";
  }

  return "你不需要一次解决全部，只要先完成最关键的下一步。";
}
