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
  advice: string;
  answer: string;
  lens: string;
  nextAction: string;
  risk: string;
};

const topicConfigs: Record<Topic, TopicConfig> = {
  love: {
    advice: "先把自己的期待说清楚，再观察对方是否有稳定回应。",
    answer: "有靠近或修复的空间，但关键在于真实表达和边界是否稳定。",
    lens: "情感回应、投入程度和关系边界",
    nextAction: "把期待说成一句具体的话，而不是只靠猜测对方态度。",
    risk: "把短暂情绪误当成长期承诺",
  },
  career: {
    advice: "把简历、作品、岗位筛选和投递节奏拆开处理，先拿到现实反馈。",
    answer: "有机会，但不是靠等待运气出现，而是靠把准备变成能被看见的材料和行动。",
    lens: "机会匹配、准备程度和执行节奏",
    nextAction: "今天先完成一个可检查动作：改一版简历、筛选 5 个岗位，或发出一次有效沟通。",
    risk: "把焦虑当成结论，或者在信息不足时过早否定自己",
  },
  money: {
    advice: "先确认底线预算和可承受风险，再决定要保守、调整还是投入。",
    answer: "局面可以改善，但需要先把安全感和实际资源分开看。",
    lens: "安全感、现金流和资源分配",
    nextAction: "列出必须支出、可调整支出和可投入资源，再做决定。",
    risk: "为了摆脱压力而做出过快的金钱决定",
  },
  study: {
    advice: "先补最影响结果的一块短板，并设置一个三天内能完成的检查点。",
    answer: "结果仍有提升空间，但要靠稳定练习，而不是反复担心。",
    lens: "专注度、阶段目标和真实准备度",
    nextAction: "把目标拆到今天能完成的一小块，先让节奏恢复起来。",
    risk: "用担心结果替代具体复习或实践",
  },
  relationship: {
    advice: "先把最容易误解的一句话讲清楚，再判断是否继续投入。",
    answer: "关系还有调整空间，但重点不是分对错，而是看沟通是否能回到同一频道。",
    lens: "互动模式、表达方式和边界感",
    nextAction: "选择一个具体场景沟通，不要一次翻完所有旧账。",
    risk: "反复消耗在谁对谁错，而没有处理真正的问题",
  },
  choice: {
    advice: "把每个选项的收益、代价和最坏情况写下来，再选择你愿意承担代价的一边。",
    answer: "选择可以更清楚，但前提是先承认每条路都有成本。",
    lens: "优先级、机会成本和可承受风险",
    nextAction: "不要找零风险答案，先排除你最不愿承担的代价。",
    risk: "寻找完全没有风险的答案，导致一直停在原地",
  },
  general: {
    advice: "先把问题缩小到一件能处理的事，再给自己一点观察时间。",
    answer: "事情还没有定死，关键在于你接下来如何把感受落到行动上。",
    lens: "现实处境、情绪状态和下一步动作",
    nextAction: "先完成最小的一步，不急着给整件事下最终判断。",
    risk: "把复杂感受混在一起，导致真正该处理的点被盖住",
  },
};

export function createLocalInterpretation(question: string, cards: DrawnCard[]) {
  const topic = detectTopic(question);
  const config = topicConfigs[topic];
  const insights = cards.map((item) => describeCardForQuestion(item, topic));
  const present = findInsight(insights, "present");
  const future = findInsight(insights, "future");

  const summary = [
    `关于“${question}”，牌面给出的回答是：${config.answer}`,
    `${present.cardName}${orientationLabels[present.orientation]}说明现在最需要处理的是${present.focus}。`,
    `${future.cardName}${orientationLabels[future.orientation]}提醒你，下一步适合${future.action}`,
  ].join("");

  const fullText =
    `1. 问题核心\n` +
    `你问的是“${question}”。这次牌面主要落在${config.lens}，重点不是简单判断成败，而是看你是否已经把关键条件准备到位。当前最需要避开的风险是：${config.risk}。\n\n` +
    `2. 单牌解析\n` +
    insights
      .map(
        (item) =>
          `${positionLabels[item.position]}：${item.cardName}（${orientationLabels[item.orientation]}）\n${item.text}`,
      )
      .join("\n\n") +
    `\n\n3. 牌阵合读\n${buildSpreadReading(insights, config)}\n\n` +
    `4. 下一步建议\n${config.advice} ${config.nextAction} ${buildClosingAdvice(cards, topic)}`;

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

function describeCardForQuestion(card: DrawnCard, topic: Topic) {
  const baseMeaning =
    card.orientation === "upright"
      ? card.card.meanings.upright
      : card.card.meanings.reversed;
  const focus = buildFocus(card, topic);
  const action = buildAction(card, topic);

  return {
    action,
    cardName: card.card.zhName,
    focus,
    orientation: card.orientation,
    position: card.position,
    text: `${baseMeaning} 放在${positionLabels[card.position]}位置，可以理解为：${focus}。对应的行动方向是：${action}。`,
  };
}

function buildFocus(card: DrawnCard, topic: Topic) {
  const reversed = card.orientation === "reversed";

  if (topic === "career") {
    if (card.position === "past") {
      return reversed ? "过去的准备方式有些分散" : "过去已经有可用的经验、能力或资源";
    }
    if (card.position === "present") {
      return reversed ? "现在容易被焦虑或犹豫卡住" : "现在需要把能力整理成别人能看懂的材料";
    }
    return reversed ? "后续节奏可能被拖慢，需要提前留缓冲" : "后续适合稳扎稳打，把申请和反馈做成连续动作";
  }

  if (topic === "study") {
    if (card.position === "present") {
      return reversed ? "现在的学习节奏需要先恢复" : "现在已有基础，但需要更具体的计划";
    }
    return reversed ? "这部分还有拖延或消耗" : "这部分可以成为稳定推进的力量";
  }

  if (topic === "love" || topic === "relationship") {
    if (card.position === "present") {
      return reversed ? "当前的表达和期待没有完全对齐" : "当前仍有沟通和靠近的空间";
    }
    return reversed ? "这部分有误解或防御" : "这部分有可以继续发展的基础";
  }

  return reversed ? "某个关键条件还不够清楚" : "这里有可以被你使用的支持";
}

function buildAction(card: DrawnCard, topic: Topic) {
  const reversed = card.orientation === "reversed";

  if (topic === "career") {
    if (card.position === "present") {
      return reversed ? "先减少无效担心，确认岗位要求和准备缺口" : "把简历、作品或项目经历打磨到能直接投递";
    }
    if (card.position === "future") {
      return reversed ? "放慢一点，先调整投递策略" : "持续投递、复盘反馈，并保持稳定节奏";
    }
    return reversed ? "整理过去遗漏的准备" : "把已有经历转成简历上的具体成果";
  }

  if (topic === "study") {
    return reversed ? "先恢复每天可坚持的节奏" : "把已有基础继续练扎实";
  }

  if (topic === "choice") {
    return reversed ? "先排除不愿承担的代价" : "选择更能长期承受的一边";
  }

  return reversed ? "先修正卡住的部分" : "顺着已经出现的机会继续推进";
}

function findInsight(
  insights: Array<ReturnType<typeof describeCardForQuestion>>,
  position: DrawnCard["position"],
) {
  return insights.find((item) => item.position === position) ?? insights[0];
}

function buildSpreadReading(
  insights: Array<ReturnType<typeof describeCardForQuestion>>,
  config: TopicConfig,
) {
  const past = findInsight(insights, "past");
  const present = findInsight(insights, "present");
  const future = findInsight(insights, "future");
  const reversedCount = insights.filter((item) => item.orientation === "reversed").length;
  const pressure =
    reversedCount >= 2
      ? "牌阵里的阻力比较明显，适合先校准条件。"
      : reversedCount === 1
        ? "牌阵不是完全停滞，而是有一个关键点需要调整。"
        : "牌阵整体比较顺，重点是把机会落实到行动里。";

  return `${past.cardName}说明基础并非空白，${present.cardName}把焦点放到眼前需要处理的具体准备，${future.cardName}则提醒你接下来要看节奏和反馈。${pressure}所以这组牌不是在说“等好运来”，而是在提醒你围绕${config.lens}做出更清楚的推进。`;
}

function buildClosingAdvice(cards: DrawnCard[], topic: Topic) {
  const reversedCount = cards.filter((item) => item.orientation === "reversed").length;

  if (topic === "career") {
    return reversedCount >= 2
      ? "先不要用一次结果定义自己，优先补作品、简历、沟通对象或申请节奏。"
      : "可以主动推进，但每一步都要留下可检查的结果。";
  }

  if (topic === "study") {
    return "把目标拆到今天就能完成的一小块，会比反复担心最终结果更有用。";
  }

  if (reversedCount >= 2) {
    return "现在更适合先整理条件，再做大的推进。";
  }

  return "先完成最关键的下一步，再根据反馈调整。";
}
