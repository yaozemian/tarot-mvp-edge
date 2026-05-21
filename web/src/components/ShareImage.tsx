import { Button } from "./Button";
import type { ReadingRecord } from "../types/tarot";

export function ShareImage({ record }: { record: ReadingRecord }) {
  async function download() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, "#080711");
    gradient.addColorStop(0.55, "#1a1632");
    gradient.addColorStop(1, "#05040b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.fillStyle = "rgba(201,168,106,0.16)";
    ctx.beginPath();
    ctx.arc(880, 180, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#c9a86a";
    ctx.font = "700 34px Georgia";
    ctx.fillText("Luna Arcana", 80, 100);

    ctx.fillStyle = "#f4edf7";
    ctx.font = "700 64px Georgia";
    wrapText(ctx, record.question, 80, 210, 920, 78);

    const cardImages = await Promise.all(
      record.cards.map((item) => loadImage(item.card.imageUrl)),
    );

    record.cards.forEach((item, index) => {
      const x = 90 + index * 320;
      ctx.fillStyle = "rgba(8,7,17,0.72)";
      roundRect(ctx, x, 540, 260, 500, 34);
      ctx.fill();
      ctx.strokeStyle = "rgba(236,217,170,0.28)";
      ctx.stroke();

      const image = cardImages[index];
      if (image) {
        drawCoverImage(ctx, image, x + 34, 570, 192, 330);
      } else {
        ctx.fillStyle = "#c9a86a";
        ctx.font = "64px Georgia";
        ctx.fillText(item.card.image, x + 102, 680);
      }

      ctx.fillStyle = "#f4edf7";
      ctx.font = "700 34px Georgia";
      ctx.fillText(item.card.zhName, x + 54, 970);
      ctx.fillStyle = "#a79bb8";
      ctx.font = "24px Arial";
      ctx.fillText(item.orientation === "upright" ? "正位" : "逆位", x + 98, 1018);
    });

    ctx.fillStyle = "#ecd9aa";
    ctx.font = "32px Georgia";
    wrapText(ctx, record.aiSummary, 80, 1060, 920, 48);

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

function loadImage(src: string | undefined) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
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
) {
  let line = "";

  for (const char of text) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
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
