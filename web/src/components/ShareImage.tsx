import { Button } from "./Button";
import { hydrateDrawnCard } from "../lib/hydrate-reading";
import type { DrawnCard, ReadingRecord } from "../types/tarot";

export function ShareImage({ record }: { record: ReadingRecord }) {
  async function download() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const cards = record.cards.map(hydrateDrawnCard);
    const cardImages = await Promise.all(
      cards.map((item) => loadImage(item.card.imageUrl)),
    );

    drawPosterBackground(ctx);
    drawHeader(ctx, record);
    drawCards(ctx, cards, cardImages);
    drawSummary(ctx, record.aiSummary);
    drawFooter(ctx);

    const link = document.createElement("a");
    link.download = "luna-arcana-reading.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-oracle">
        分享图
      </p>
      <p className="mt-4 text-sm leading-7 text-mist">
        生成包含问题、三张牌和简要解读的竖版图片，适合保存或分享。
      </p>
      <Button className="mt-6" onClick={download} type="button">
        生成并下载
      </Button>
    </div>
  );
}

function drawPosterBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#070612");
  gradient.addColorStop(0.52, "#121027");
  gradient.addColorStop(1, "#05040c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.strokeStyle = "rgba(236,217,170,0.16)";
  ctx.lineWidth = 1;
  for (let y = 170; y <= 1230; y += 116) {
    ctx.beginPath();
    ctx.moveTo(82, y);
    ctx.lineTo(998, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(201,168,106,0.08)";
  roundRect(ctx, 52, 50, 976, 1250, 42);
  ctx.fill();
  ctx.strokeStyle = "rgba(236,217,170,0.22)";
  ctx.stroke();
}

function drawHeader(ctx: CanvasRenderingContext2D, record: ReadingRecord) {
  ctx.fillStyle = "#d8b86e";
  ctx.font = "700 30px Georgia";
  ctx.fillText("Luna Arcana", 96, 116);

  ctx.fillStyle = "rgba(244,237,247,0.58)";
  ctx.font = "700 20px Arial";
  ctx.fillText(record.mode === "daily" ? "DAILY TAROT" : "THREE-CARD READING", 96, 150);

  ctx.fillStyle = "#f7f2ff";
  ctx.font = "800 56px Arial";
  wrapText(ctx, record.question, 96, 226, 888, 66, 2);
}

function drawCards(
  ctx: CanvasRenderingContext2D,
  cards: DrawnCard[],
  images: Array<HTMLImageElement | null>,
) {
  cards.forEach((item, index) => {
    const x = 86 + index * 318;
    const y = 376;

    ctx.fillStyle = "rgba(5,4,12,0.84)";
    roundRect(ctx, x, y, 272, 484, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(236,217,170,0.28)";
    ctx.stroke();

    const image = images[index];
    if (image) {
      drawCoverImage(ctx, image, x + 31, y + 34, 210, 356);
    } else {
      ctx.fillStyle = "#d8b86e";
      ctx.font = "64px Georgia";
      ctx.textAlign = "center";
      ctx.fillText(item.card.image, x + 136, y + 215);
      ctx.textAlign = "left";
    }

    ctx.fillStyle = "#f7f2ff";
    ctx.font = "800 32px Arial";
    drawCenteredText(ctx, item.card.zhName, x + 136, y + 426);

    ctx.fillStyle = "rgba(244,237,247,0.62)";
    ctx.font = "24px Arial";
    drawCenteredText(ctx, item.orientation === "upright" ? "正位" : "逆位", x + 136, y + 464);
  });
}

function drawSummary(ctx: CanvasRenderingContext2D, summary: string) {
  ctx.fillStyle = "rgba(247,242,255,0.08)";
  roundRect(ctx, 86, 914, 908, 276, 26);
  ctx.fill();
  ctx.strokeStyle = "rgba(236,217,170,0.22)";
  ctx.stroke();

  ctx.fillStyle = "#d8b86e";
  ctx.font = "700 22px Arial";
  ctx.fillText("解读摘要", 126, 970);

  ctx.fillStyle = "#f1dfab";
  ctx.font = "700 30px Arial";
  wrapText(ctx, summary, 126, 1030, 828, 44, 4);
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "rgba(236,217,170,0.22)";
  ctx.beginPath();
  ctx.moveTo(96, 1240);
  ctx.lineTo(984, 1240);
  ctx.stroke();

  ctx.fillStyle = "rgba(244,237,247,0.46)";
  ctx.font = "20px Arial";
  drawCenteredText(ctx, "luna arcana tarot", 540, 1282);
}

function loadImage(src: string | undefined) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  let line = "";
  let lines = 0;

  for (const char of text) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines += 1;
      if (lines >= maxLines) {
        ctx.fillText(`${line.slice(0, Math.max(0, line.length - 1))}…`, x, y);
        return;
      }
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = next;
    }
  }

  if (line) {
    ctx.fillText(line, x, y);
  }
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
