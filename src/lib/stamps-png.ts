import zlib from "node:zlib";

export interface StampStripRenderOptions {
  primaryColor?: string | null;
  stamps: number;
  stampsRequired: number;
  isCashback: boolean;
  isVip: boolean;
  isActivated: boolean;
  totalVisits: number;
  vipVisitsThreshold: number;
  iconOrNiche?: string | null;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const IMAGE_WIDTH = 1032;
const IMAGE_HEIGHT = 336;

// Precomputed IEEE 802.3 CRC32 lookup table for valid PNG chunk checksums
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodeRgbaToPng(width: number, height: number, rgba: Uint8Array): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const rawScanlines = Buffer.allocUnsafe(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    rawScanlines[rowStart] = 0; // filter type 0 (None)
    const srcOffset = y * stride;
    rawScanlines.set(rgba.subarray(srcOffset, srcOffset + stride), rowStart + 1);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 6 });

  return Buffer.concat([
    signature,
    makePngChunk("IHDR", ihdr),
    makePngChunk("IDAT", compressed),
    makePngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function parseHexRgb(rawColor?: string | null): { r: number; g: number; b: number } {
  const cleaned = (rawColor || "").trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    const num = parseInt(cleaned, 16);
    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff,
    };
  }
  return { r: 0, g: 128, b: 105 }; // #008069 fallback
}

function blendPixel(
  buf: Uint8Array,
  idx: number,
  sr: number,
  sg: number,
  sb: number,
  alpha01: number
): void {
  if (alpha01 <= 0) return;
  const a = alpha01 >= 1 ? 1 : alpha01;
  const inv = 1 - a;
  buf[idx] = Math.round(sr * a + buf[idx] * inv);
  buf[idx + 1] = Math.round(sg * a + buf[idx + 1] * inv);
  buf[idx + 2] = Math.round(sb * a + buf[idx + 2] * inv);
  buf[idx + 3] = 255;
}

function clamp01(val: number): number {
  return val < 0 ? 0 : val > 1 ? 1 : val;
}

function smoothCoverage(signedDistance: number): number {
  return clamp01(0.5 - signedDistance);
}

function fillBackgroundGradient(
  buf: Uint8Array,
  width: number,
  height: number,
  base: { r: number; g: number; b: number }
): void {
  const darkR = Math.round(base.r * 0.72);
  const darkG = Math.round(base.g * 0.72);
  const darkB = Math.round(base.b * 0.72);

  for (let y = 0; y < height; y++) {
    const ty = y / Math.max(1, height - 1);
    for (let x = 0; x < width; x++) {
      const tx = x / Math.max(1, width - 1);
      const t = tx * 0.35 + ty * 0.65;
      const idx = (y * width + x) * 4;
      buf[idx] = Math.round(base.r * (1 - t) + darkR * t);
      buf[idx + 1] = Math.round(base.g * (1 - t) + darkG * t);
      buf[idx + 2] = Math.round(base.b * (1 - t) + darkB * t);
      buf[idx + 3] = 255;
    }
  }
}

function drawRoundedBox(
  buf: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fill: RgbaColor,
  border?: RgbaColor,
  borderWidth: number = 2
): void {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const bx = Math.max(0, w / 2 - radius);
  const by = Math.max(0, h / 2 - radius);

  const minX = Math.max(0, Math.floor(x - 2));
  const maxX = Math.min(width - 1, Math.ceil(x + w + 2));
  const minY = Math.max(0, Math.floor(y - 2));
  const maxY = Math.min(height - 1, Math.ceil(y + h + 2));

  for (let py = minY; py <= maxY; py++) {
    const dy = Math.abs(py - cy) - by;
    const qy = Math.max(dy, 0);
    for (let px = minX; px <= maxX; px++) {
      const dx = Math.abs(px - cx) - bx;
      const qx = Math.max(dx, 0);
      const outside = Math.hypot(qx, qy);
      const inside = Math.min(Math.max(dx, dy), 0);
      const sd = outside + inside - radius;

      const idx = (py * width + px) * 4;
      const fillCov = smoothCoverage(sd);
      if (fillCov > 0 && fill.a > 0) {
        blendPixel(buf, idx, fill.r, fill.g, fill.b, fillCov * (fill.a / 255));
      }

      if (border && border.a > 0) {
        const halfBw = borderWidth / 2;
        const borderDist = Math.abs(sd + halfBw) - halfBw;
        const borderCov = smoothCoverage(borderDist);
        if (borderCov > 0) {
          blendPixel(
            buf,
            idx,
            border.r,
            border.g,
            border.b,
            borderCov * (border.a / 255)
          );
        }
      }
    }
  }
}

function drawGradientCircle(
  buf: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  topColor: RgbaColor,
  bottomColor: RgbaColor,
  borderColor?: RgbaColor,
  borderWidth: number = 2,
  dashed: boolean = false
): void {
  const minX = Math.max(0, Math.floor(cx - radius - 3));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius + 3));
  const minY = Math.max(0, Math.floor(cy - radius - 3));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius + 3));

  const dashCount = 14;

  for (let py = minY; py <= maxY; py++) {
    const dy = py - cy;
    const t = clamp01((dy + radius) / (2 * radius));
    const fr = Math.round(topColor.r * (1 - t) + bottomColor.r * t);
    const fg = Math.round(topColor.g * (1 - t) + bottomColor.g * t);
    const fb = Math.round(topColor.b * (1 - t) + bottomColor.b * t);
    const fa = (topColor.a * (1 - t) + bottomColor.a * t) / 255;

    for (let px = minX; px <= maxX; px++) {
      const dx = px - cx;
      const dist = Math.hypot(dx, dy);
      const sd = dist - radius;
      const idx = (py * width + px) * 4;

      const fillCov = smoothCoverage(sd);
      if (fillCov > 0 && fa > 0) {
        blendPixel(buf, idx, fr, fg, fb, fillCov * fa);
      }

      if (borderColor && borderColor.a > 0) {
        const halfBw = borderWidth / 2;
        const ringDist = Math.abs(sd + halfBw) - halfBw;
        let ringCov = smoothCoverage(ringDist);
        if (ringCov > 0 && dashed) {
          const angle = Math.atan2(dy, dx) + Math.PI;
          const phase = ((angle / (2 * Math.PI)) * dashCount) % 1;
          if (phase > 0.58) {
            ringCov = 0;
          }
        }
        if (ringCov > 0) {
          blendPixel(
            buf,
            idx,
            borderColor.r,
            borderColor.g,
            borderColor.b,
            ringCov * (borderColor.a / 255)
          );
        }
      }
    }
  }
}

function drawCapsuleLine(
  buf: Uint8Array,
  width: number,
  height: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeRadius: number,
  color: RgbaColor
): void {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lenSq = vx * vx + vy * vy || 1;
  const pad = Math.ceil(strokeRadius + 2);

  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - pad));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(x1, x2) + pad));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - pad));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(y1, y2) + pad));

  const alphaScale = color.a / 255;

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const wx = px - x1;
      const wy = py - y1;
      const proj = clamp01((wx * vx + wy * vy) / lenSq);
      const dist = Math.hypot(wx - vx * proj, wy - vy * proj) - strokeRadius;
      const cov = smoothCoverage(dist);
      if (cov > 0) {
        blendPixel(
          buf,
          (py * width + px) * 4,
          color.r,
          color.g,
          color.b,
          cov * alphaScale
        );
      }
    }
  }
}

function drawRing(
  buf: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  strokeRadius: number,
  color: RgbaColor
): void {
  const outer = radius + strokeRadius + 2;
  const minX = Math.max(0, Math.floor(cx - outer));
  const maxX = Math.min(width - 1, Math.ceil(cx + outer));
  const minY = Math.max(0, Math.floor(cy - outer));
  const maxY = Math.min(height - 1, Math.ceil(cy + outer));
  const alphaScale = color.a / 255;

  for (let py = minY; py <= maxY; py++) {
    const dy = py - cy;
    for (let px = minX; px <= maxX; px++) {
      const dx = px - cx;
      const sd = Math.abs(Math.hypot(dx, dy) - radius) - strokeRadius;
      const cov = smoothCoverage(sd);
      if (cov > 0) {
        blendPixel(
          buf,
          (py * width + px) * 4,
          color.r,
          color.g,
          color.b,
          cov * alphaScale
        );
      }
    }
  }
}

function drawCheckGlyph(
  buf: Uint8Array,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const stroke = Math.max(2.6, scale * 0.14);
  const p1x = cx - scale * 0.34;
  const p1y = cy + scale * 0.03;
  const p2x = cx - scale * 0.08;
  const p2y = cy + scale * 0.28;
  const p3x = cx + scale * 0.36;
  const p3y = cy - scale * 0.25;

  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, p1x, p1y, p2x, p2y, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, p2x, p2y, p3x, p3y, stroke, color);
}

function drawGiftGlyph(
  buf: Uint8Array,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const stroke = Math.max(1.3, scale * 0.045);
  const halfW = scale * 0.34;
  const boxHalfW = scale * 0.29;
  const lidTop = cy - scale * 0.08;
  const lidBottom = cy + scale * 0.06;
  const boxTop = lidBottom + stroke * 1.6;
  const boxBottom = cy + scale * 0.36;

  // Lid & Box outline with thin crisp strokes
  drawRoundedBox(
    buf,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    cx - halfW,
    lidTop,
    halfW * 2,
    lidBottom - lidTop,
    2.5,
    { r: 0, g: 0, b: 0, a: 0 },
    color,
    stroke * 1.9
  );
  drawRoundedBox(
    buf,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    cx - boxHalfW,
    boxTop,
    boxHalfW * 2,
    boxBottom - boxTop,
    2.5,
    { r: 0, g: 0, b: 0, a: 0 },
    color,
    stroke * 1.9
  );
  // Center vertical ribbon
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx, lidTop + 1, cx, boxBottom - 1, stroke * 0.95, color);
  // Two neat ribbon bow loops above lid
  drawRing(
    buf,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    cx - scale * 0.13,
    lidTop - scale * 0.11,
    scale * 0.095,
    stroke * 0.9,
    color
  );
  drawRing(
    buf,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    cx + scale * 0.13,
    lidTop - scale * 0.11,
    scale * 0.095,
    stroke * 0.9,
    color
  );
}

function drawCrownGlyph(
  buf: Uint8Array,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const stroke = Math.max(1.9, scale * 0.085);
  const lx = cx - scale * 0.36;
  const rx = cx + scale * 0.36;
  const topY = cy - scale * 0.28;
  const midY = cy + scale * 0.02;
  const baseY = cy + scale * 0.24;

  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, lx, baseY, lx - scale * 0.06, topY + scale * 0.08, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, lx - scale * 0.06, topY + scale * 0.08, cx - scale * 0.16, midY, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx - scale * 0.16, midY, cx, topY, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx, topY, cx + scale * 0.16, midY, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx + scale * 0.16, midY, rx + scale * 0.06, topY + scale * 0.08, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, rx + scale * 0.06, topY + scale * 0.08, rx, baseY, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, lx, baseY, rx, baseY, stroke, color);
  drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, lx, baseY + scale * 0.12, rx, baseY + scale * 0.12, stroke, color);
}

function drawNicheGlyph(
  buf: Uint8Array,
  iconOrNiche: string | null | undefined,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const key = (iconOrNiche || "store")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const stroke = Math.max(1.25, scale * 0.045);

  if (key === "coffee" || key === "cafe" || key === "cupsoda") {
    const cupW = scale * 0.50;
    const cupH = scale * 0.42;
    const cupX = cx - cupW * 0.56;
    const cupY = cy - scale * 0.04;
    drawRoundedBox(
      buf,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      cupX,
      cupY,
      cupW,
      cupH,
      6,
      { r: 0, g: 0, b: 0, a: 0 },
      color,
      stroke * 1.9
    );
    // Clean right-side cup handle
    drawRing(
      buf,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      cupX + cupW + scale * 0.085,
      cupY + cupH * 0.44,
      scale * 0.09,
      stroke * 0.85,
      color
    );
    // Saucer base line
    drawCapsuleLine(
      buf,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      cupX - scale * 0.04,
      cupY + cupH + scale * 0.09,
      cupX + cupW + scale * 0.06,
      cupY + cupH + scale * 0.09,
      stroke * 0.9,
      color
    );
    // Thin separated steam wisps
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cupX + cupW * 0.22, cupY - scale * 0.11, cupX + cupW * 0.22, cupY - scale * 0.23, stroke * 0.8, color);
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cupX + cupW * 0.52, cupY - scale * 0.11, cupX + cupW * 0.52, cupY - scale * 0.26, stroke * 0.8, color);
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cupX + cupW * 0.82, cupY - scale * 0.11, cupX + cupW * 0.82, cupY - scale * 0.21, stroke * 0.8, color);
    return;
  }

  if (key === "scissors" || key === "barber") {
    drawRing(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx - scale * 0.24, cy - scale * 0.2, scale * 0.12, stroke * 0.9, color);
    drawRing(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx - scale * 0.24, cy + scale * 0.2, scale * 0.12, stroke * 0.9, color);
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx - scale * 0.14, cy - scale * 0.14, cx + scale * 0.34, cy + scale * 0.24, stroke * 0.95, color);
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx - scale * 0.14, cy + scale * 0.14, cx + scale * 0.34, cy - scale * 0.24, stroke * 0.95, color);
    return;
  }

  if (key === "heart") {
    const r = scale * 0.16;
    drawGradientCircle(
      buf,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      cx - r * 0.8,
      cy - scale * 0.08,
      r,
      color,
      color
    );
    drawGradientCircle(
      buf,
      IMAGE_WIDTH,
      IMAGE_HEIGHT,
      cx + r * 0.8,
      cy - scale * 0.08,
      r,
      color,
      color
    );
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx - r * 1.4, cy - scale * 0.02, cx, cy + scale * 0.28, r * 0.85, color);
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, cx + r * 1.4, cy - scale * 0.02, cx, cy + scale * 0.28, r * 0.85, color);
    return;
  }

  if (key === "crown" || key === "vip") {
    drawCrownGlyph(buf, cx, cy, scale, color);
    return;
  }

  // Clean 5-point star stamp emblem (universally crisp across cafes, snacks, salons, retail)
  const outerR = scale * 0.38;
  const innerR = scale * 0.17;
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
  }
  for (let i = 0; i < 10; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % 10];
    drawCapsuleLine(buf, IMAGE_WIDTH, IMAGE_HEIGHT, a.x, a.y, b.x, b.y, stroke * 0.85, color);
  }
}

/**
 * Renders a crisp 1032x336 PNG visual stamp strip (or cashback VIP gauge) for Google Wallet heroImage.
 */
export function renderStampsStripPng(options: StampStripRenderOptions): Buffer {
  const rgba = new Uint8Array(IMAGE_WIDTH * IMAGE_HEIGHT * 4);
  const baseRgb = parseHexRgb(options.primaryColor);
  fillBackgroundGradient(rgba, IMAGE_WIDTH, IMAGE_HEIGHT, baseRgb);

  const trayX = 44;
  const trayY = 24;
  const trayW = IMAGE_WIDTH - 88;
  const trayH = IMAGE_HEIGHT - 48;

  const trayBorder: RgbaColor = options.isVip
    ? { r: 251, g: 191, b: 36, a: 150 }
    : { r: 255, g: 255, b: 255, a: 55 };

  drawRoundedBox(
    rgba,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    trayX,
    trayY,
    trayW,
    trayH,
    36,
    { r: 0, g: 0, b: 0, a: 74 },
    trayBorder,
    2
  );

  // Cashback / VIP bar mode
  if (options.isCashback) {
    const badgeRadius = 56;
    const badgeCx = trayX + 96;
    const badgeCy = IMAGE_HEIGHT / 2;

    if (options.isVip) {
      drawGradientCircle(
        rgba,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        badgeCx,
        badgeCy,
        badgeRadius,
        { r: 252, g: 211, b: 77, a: 255 },
        { r: 245, g: 158, b: 11, a: 255 },
        { r: 254, g: 243, b: 199, a: 255 },
        3
      );
      drawCrownGlyph(rgba, badgeCx, badgeCy, 56, { r: 17, g: 24, b: 39, a: 255 });
    } else {
      drawGradientCircle(
        rgba,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        badgeCx,
        badgeCy,
        badgeRadius,
        { r: 52, g: 211, b: 153, a: 255 },
        { r: 5, g: 150, b: 105, a: 255 },
        { r: 167, g: 243, b: 208, a: 255 },
        3
      );
      drawGiftGlyph(rgba, badgeCx, badgeCy, 54, { r: 255, g: 255, b: 255, a: 255 });
    }

    const segments = 8;
    const barStartX = badgeCx + badgeRadius + 36;
    const barEndX = trayX + trayW - 40;
    const gap = 14;
    const segW = (barEndX - barStartX - gap * (segments - 1)) / segments;
    const segH = 44;
    const segY = IMAGE_HEIGHT / 2 - segH / 2;

    const threshold = Math.max(1, options.vipVisitsThreshold || 10);
    const ratio = options.isVip
      ? 1
      : Math.min(1, Math.max(0, options.totalVisits || 0) / threshold);
    const activeCount = options.isActivated
      ? Math.max(1, Math.round(ratio * segments))
      : 0;

    for (let i = 0; i < segments; i++) {
      const isActive = i < activeCount;
      drawRoundedBox(
        rgba,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        barStartX + i * (segW + gap),
        segY,
        segW,
        segH,
        20,
        isActive
          ? { r: 251, g: 191, b: 36, a: 255 }
          : { r: 255, g: 255, b: 255, a: 36 },
        isActive
          ? { r: 254, g: 243, b: 199, a: 255 }
          : { r: 255, g: 255, b: 255, a: 50 },
        2
      );
    }

    return encodeRgbaToPng(IMAGE_WIDTH, IMAGE_HEIGHT, rgba);
  }

  // Stamps Grid Layout (1 row for <=6 stamps, 2 balanced rows for 7..20 stamps)
  const totalRequired = Math.max(1, Math.min(20, options.stampsRequired || 5));
  const earnedCount = options.isActivated
    ? Math.max(0, Math.min(totalRequired, options.stamps || 0))
    : 0;

  const useTwoRows = totalRequired > 6;
  const firstRowCount = useTwoRows ? Math.ceil(totalRequired / 2) : totalRequired;
  const secondRowCount = useTwoRows ? totalRequired - firstRowCount : 0;

  let circleDiameter = 114;
  let gap = 24;
  if (!useTwoRows) {
    if (firstRowCount <= 4) {
      circleDiameter = 128;
      gap = 30;
    } else if (firstRowCount === 5) {
      circleDiameter = 118;
      gap = 26;
    } else {
      circleDiameter = 104;
      gap = 22;
    }
  } else if (firstRowCount <= 5) {
    circleDiameter = 92;
    gap = 22;
  } else if (firstRowCount <= 7) {
    circleDiameter = 78;
    gap = 16;
  } else {
    circleDiameter = 66;
    gap = 12;
  }

  const radius = circleDiameter / 2;
  const rowGap = 18;
  const rows: number[][] = [Array.from({ length: firstRowCount }, (_, i) => i)];
  if (secondRowCount > 0) {
    rows.push(Array.from({ length: secondRowCount }, (_, i) => firstRowCount + i));
  }

  const totalRowsHeight =
    rows.length * circleDiameter + (rows.length - 1) * rowGap;
  const startTopY = IMAGE_HEIGHT / 2 - totalRowsHeight / 2 + radius;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const rowWidth = row.length * circleDiameter + (row.length - 1) * gap;
    const startLeftX = IMAGE_WIDTH / 2 - rowWidth / 2 + radius;
    const cy = startTopY + rowIdx * (circleDiameter + rowGap);

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const slotIndex = row[colIdx];
      const cx = startLeftX + colIdx * (circleDiameter + gap);
      const isCollected = slotIndex < earnedCount;
      const isGiftSlot = slotIndex === totalRequired - 1;

      if (isGiftSlot) {
        if (isCollected) {
          drawGradientCircle(
            rgba,
            IMAGE_WIDTH,
            IMAGE_HEIGHT,
            cx,
            cy,
            radius,
            { r: 252, g: 211, b: 77, a: 255 },
            { r: 245, g: 158, b: 11, a: 255 },
            { r: 254, g: 243, b: 199, a: 255 },
            3
          );
          drawGiftGlyph(rgba, cx, cy, circleDiameter * 0.56, {
            r: 17,
            g: 24,
            b: 39,
            a: 255,
          });
        } else {
          drawGradientCircle(
            rgba,
            IMAGE_WIDTH,
            IMAGE_HEIGHT,
            cx,
            cy,
            radius,
            { r: 0, g: 0, b: 0, a: 95 },
            { r: 0, g: 0, b: 0, a: 120 },
            { r: 251, g: 191, b: 36, a: 235 },
            2.5,
            true
          );
          drawGiftGlyph(rgba, cx, cy, circleDiameter * 0.56, {
            r: 252,
            g: 211,
            b: 77,
            a: 255,
          });
        }
        continue;
      }

      if (isCollected) {
        drawGradientCircle(
          rgba,
          IMAGE_WIDTH,
          IMAGE_HEIGHT,
          cx,
          cy,
          radius,
          { r: 52, g: 211, b: 153, a: 255 },
          { r: 5, g: 150, b: 105, a: 255 },
          { r: 167, g: 243, b: 208, a: 255 },
          3
        );
        drawCheckGlyph(rgba, cx, cy, circleDiameter * 0.56, {
          r: 255,
          g: 255,
          b: 255,
          a: 255,
        });
      } else {
        drawGradientCircle(
          rgba,
          IMAGE_WIDTH,
          IMAGE_HEIGHT,
          cx,
          cy,
          radius,
          { r: 0, g: 0, b: 0, a: 80 },
          { r: 0, g: 0, b: 0, a: 105 },
          { r: 255, g: 255, b: 255, a: 68 },
          2
        );
        drawNicheGlyph(
          rgba,
          options.iconOrNiche,
          cx,
          cy,
          circleDiameter * 0.56,
          { r: 255, g: 255, b: 255, a: 150 }
        );
      }
    }
  }

  return encodeRgbaToPng(IMAGE_WIDTH, IMAGE_HEIGHT, rgba);
}
