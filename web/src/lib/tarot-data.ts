import type { TarotCard } from "../types/tarot";

export const tarotDeck: TarotCard[] = [
  { id: "fool", name: "The Fool", zhName: "愚者", image: "✦", meanings: { upright: "新的开始、信任直觉、轻装上路。", reversed: "冲动、准备不足、忽略现实边界。" } },
  { id: "magician", name: "The Magician", zhName: "魔术师", image: "☿", meanings: { upright: "资源到位、主动创造、把想法落地。", reversed: "能量分散、表达失真、尚未对齐目标。" } },
  { id: "high-priestess", name: "The High Priestess", zhName: "女祭司", image: "☾", meanings: { upright: "内在智慧、直觉、暂时保持观察。", reversed: "压抑感受、信息不清、过度猜测。" } },
  { id: "empress", name: "The Empress", zhName: "女皇", image: "✺", meanings: { upright: "滋养、丰盛、关系和创作的生长。", reversed: "消耗、过度照顾、缺少自我滋养。" } },
  { id: "emperor", name: "The Emperor", zhName: "皇帝", image: "♜", meanings: { upright: "秩序、责任、建立稳定结构。", reversed: "控制感过强、僵化、权责不清。" } },
  { id: "lovers", name: "The Lovers", zhName: "恋人", image: "♡", meanings: { upright: "选择、联结、价值观对齐。", reversed: "摇摆、关系失衡、真实需求被回避。" } },
  { id: "chariot", name: "The Chariot", zhName: "战车", image: "◆", meanings: { upright: "意志、推进、在拉扯中保持方向。", reversed: "失控、急于证明、节奏被外界带走。" } },
  { id: "strength", name: "Strength", zhName: "力量", image: "♌", meanings: { upright: "温柔的勇气、自我安抚、持续行动。", reversed: "自我怀疑、压抑怒气、能量透支。" } },
  { id: "hermit", name: "The Hermit", zhName: "隐士", image: "✧", meanings: { upright: "独处、内省、寻找真正的答案。", reversed: "孤立、逃避交流、陷入反复思考。" } },
  { id: "wheel", name: "Wheel of Fortune", zhName: "命运之轮", image: "◎", meanings: { upright: "转机、周期变化、顺势调整。", reversed: "抗拒变化、重复旧模式、时机未稳。" } },
  { id: "star", name: "The Star", zhName: "星星", image: "✶", meanings: { upright: "希望、疗愈、重新相信未来。", reversed: "信心低落、期待落空、需要恢复感受力。" } },
  { id: "moon", name: "The Moon", zhName: "月亮", image: "☽", meanings: { upright: "潜意识、暧昧、看见恐惧背后的讯息。", reversed: "迷雾散去、误解浮现、情绪需要被命名。" } },
];
