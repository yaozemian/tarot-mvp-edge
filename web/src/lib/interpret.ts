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
  focus: string;
  opening: string;
  advice: string;
};

const topicConfigs: Record<Topic, TopicConfig> = {
  love: {
    focus: "感情里的真实期待、投入方式和边界感",
    opening: "这次牌面更像是在回应你在情感中真正想靠近什么、又害怕失去什么。",
    advice: "建议你先确认自己想要的是关系推进、情绪确认，还是边界稳定。把期待说清楚，比反复猜测对方更有效。",
  },
  career: {
    focus: "工作推进、职场节奏和你对结果的掌控感",
    opening: "这组牌主要落在行动节奏和现实资源上，不是在说空泛的运气，而是在提醒你怎么推进得更稳。",
    advice: "下一步优先处理最直接影响结果的一件事，例如沟通、交付、排期或决策顺序，不要把精力分散在次要噪音上。",
  },
  money: {
    focus: "金钱压力、安全感和资源分配",
    opening: "牌面显示你关心的不只是钱本身，更是钱背后带来的稳定感和选择空间。",
    advice: "先区分眼前的现实压力和想象中的焦虑，再决定要保守、调整还是投入。先保底，再谈冒险。",
  },
  study: {
    focus: "学习状态、专注度和阶段目标",
    opening: "这次解读更偏向提醒你怎样恢复节奏，而不是单纯判断结果好坏。",
    advice: "把目标拆小，先完成眼前最可执行的一步。持续感比一次性的冲劲更重要。",
  },
  relationship: {
    focus: "人与人之间的互动模式、误解和边界",
    opening: "问题核心更像在关系互动本身，而不是谁对谁错。",
    advice: "先看清这段关系里重复出现的模式，再决定是继续靠近、重新沟通，还是适当后退。",
  },
  choice: {
    focus: "你在选择面前的犹豫、代价和优先级",
    opening: "牌面没有在替你直接做决定，而是在帮助你看清每个选项背后的真实代价。",
    advice: "不要问哪条路完全没有风险，而要问哪种代价是你愿意承受的。把优先级排出来，选择会更清楚。",
  },
  general: {
    focus: "你当前状态中的情绪节奏、现实处境和接下来更合适的姿态",
    opening: "这次牌面像是一面镜子，帮助你把问题里的关键矛盾看得更清楚。",
    advice: "建议先处理最有现实影响的一件事，同时保留一点观察时间，不急着下绝对结论。",
  },
};

export function createLocalInterpretation(question: string, cards: DrawnCard[]) {
  const topic = detectTopic(question);
  const config = topicConfigs[topic];
  const cardInsights = cards.map((item) => describeCardForQuestion(item, topic));

  const summary = `围绕“${question}”，这次牌面更关注${config.focus}。${config.opening}${buildSummaryThread(cardInsights)}`;

  const fullText =
    `1. 总体结论\n` +
    `关于“${question}”，这组牌不是在给你一个脱离语境的通用答案，而是在提醒你当前最该看见的重点：${config.focus}。` +
    `${config.opening}\n\n` +
    `2. 单牌解析\n` +
    cardInsights
      .map(
        (item) =>
          `${positionLabels[item.position]}：${item.cardName}（${orientationLabels[item.orientation]}）\n${item.text}`,
      )
      .join("\n\n") +
    `\n\n3. 建议\n${config.advice} ${buildClosingAdvice(cards, topic)}`;

  return { fullText, summary };
}

function detectTopic(question: string): Topic {
  const text = question.toLowerCase();

  if (hasAny(text, ["喜欢", "恋爱", "感情", "对象", "前任", "暧昧", "结婚", "分手"])) {
    return "love";
  }

  if (hasAny(text, ["工作", "离职", "跳槽", "面试", "职场", "项目", "offer", "升职", "创业"])) {
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

  const topicSentence = buildTopicSentence(card.position, topic, card.orientation);

  return {
    cardName: card.card.zhName,
    orientation: card.orientation,
    position: card.position,
    text: `${baseMeaning} 这张牌放在${positionLabels[card.position]}位置，说明${topicSentence}`,
  };
}

function buildTopicSentence(
  position: DrawnCard["position"],
  topic: Topic,
  orientation: DrawnCard["orientation"],
) {
  const tone =
    orientation === "upright"
      ? "这部分力量可以被你主动使用。"
      : "这里的阻力需要你先看清，再决定怎么处理。";

  const topicMap: Record<Topic, Record<DrawnCard["position"], string>> = {
    love: {
      past: `你过去在感情里已经形成了一种惯性或期待，正在影响你现在的判断。${tone}`,
      present: `你此刻最需要面对的是关系里的真实需求，而不是表面的回应。${tone}`,
      future: `接下来感情会往更清楚的方向发展，但前提是你愿意表达和取舍。${tone}`,
    },
    career: {
      past: `你之前的工作方式、成绩或压力，仍然决定着你现在的节奏。${tone}`,
      present: `当下关键不在空想结果，而在怎么处理眼前最重要的事务。${tone}`,
      future: `后续走向取决于你是否能把行动顺序和资源分配重新梳理好。${tone}`,
    },
    money: {
      past: `你过去对安全感的判断，影响了你现在对金钱的反应。${tone}`,
      present: `当前最重要的是看清现实财务状态，而不是被焦虑放大想象。${tone}`,
      future: `之后的局面会因为你的分配方式和取舍而改变。${tone}`,
    },
    study: {
      past: `你之前积累的状态或拖延，正在影响当前学习效率。${tone}`,
      present: `此刻的重点是恢复节奏感和专注度，而不是一次性追求完美。${tone}`,
      future: `后续结果更依赖持续投入，而不是短期情绪。${tone}`,
    },
    relationship: {
      past: `过去的相处模式仍在延续，所以你现在会有熟悉的拉扯感。${tone}`,
      present: `你此刻最需要处理的是沟通方式和彼此边界。${tone}`,
      future: `后面这段关系会更清楚，但也要求你们面对真正的问题。${tone}`,
    },
    choice: {
      past: `你过去做决定的方式，仍在影响这次选择。${tone}`,
      present: `现在最重要的是认清你真正优先考虑的是什么。${tone}`,
      future: `接下来的结果取决于你是否接受选择本身必然伴随代价。${tone}`,
    },
    general: {
      past: `过去的经历还在塑造你对这件事的反应方式。${tone}`,
      present: `当下重点是把注意力放回最真实、最具体的处境。${tone}`,
      future: `后续会逐渐明朗，但取决于你接下来采用的姿态。${tone}`,
    },
  };

  return topicMap[topic][position];
}

function buildSummaryThread(
  insights: Array<{ position: DrawnCard["position"]; orientation: DrawnCard["orientation"] }>,
) {
  const present = insights.find((item) => item.position === "present");
  const future = insights.find((item) => item.position === "future");

  const presentTone =
    present?.orientation === "reversed" ? "你眼下有一点卡住" : "你眼下其实有可用的空间";
  const futureTone =
    future?.orientation === "reversed"
      ? "但未来更像是在提醒你不要继续沿着旧惯性推进。"
      : "而未来牌也说明，只要调整方式，局面有机会向更明朗的方向走。";

  return `${presentTone}，${futureTone}`;
}

function buildClosingAdvice(cards: DrawnCard[], topic: Topic) {
  const reversedCount = cards.filter((item) => item.orientation === "reversed").length;

  if (reversedCount >= 2) {
    return topic === "love"
      ? "这次更适合先稳住情绪和边界，再谈关系推进。"
      : "这次更适合先做校准和整理，而不是立刻强推结果。";
  }

  if (reversedCount === 0) {
    return topic === "career"
      ? "你可以更主动一些，把好的时机落实到明确行动上。"
      : "整体牌面并不悲观，关键是把感觉落到实际动作。";
  }

  return "你不需要一下子解决所有问题，只要先把最关键的那一步走对。";
}
