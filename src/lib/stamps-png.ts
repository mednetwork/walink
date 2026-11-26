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
  width?: number;
  height?: number;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const DEFAULT_IMAGE_WIDTH = 1032;
const DEFAULT_IMAGE_HEIGHT = 336;

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
  return { r: 0, g: 128, b: 105 };
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

function drawGradientRoundedTile(
  buf: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  size: number,
  radius: number,
  topColor: RgbaColor,
  bottomColor: RgbaColor,
  borderColor?: RgbaColor,
  borderWidth: number = 2,
  dashed: boolean = false
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const bx = Math.max(0, size / 2 - radius);
  const by = Math.max(0, size / 2 - radius);

  const minX = Math.max(0, Math.floor(x - 3));
  const maxX = Math.min(width - 1, Math.ceil(x + size + 3));
  const minY = Math.max(0, Math.floor(y - 3));
  const maxY = Math.min(height - 1, Math.ceil(y + size + 3));

  const dashCount = 16;

  for (let py = minY; py <= maxY; py++) {
    const dySigned = py - cy;
    const dy = Math.abs(dySigned) - by;
    const qy = Math.max(dy, 0);
    const t = clamp01((py - y) / Math.max(1, size));
    const fr = Math.round(topColor.r * (1 - t) + bottomColor.r * t);
    const fg = Math.round(topColor.g * (1 - t) + bottomColor.g * t);
    const fb = Math.round(topColor.b * (1 - t) + bottomColor.b * t);
    const fa = (topColor.a * (1 - t) + bottomColor.a * t) / 255;

    for (let px = minX; px <= maxX; px++) {
      const dxSigned = px - cx;
      const dx = Math.abs(dxSigned) - bx;
      const qx = Math.max(dx, 0);
      const sd = Math.hypot(qx, qy) + Math.min(Math.max(dx, dy), 0) - radius;
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
          const angle = Math.atan2(dySigned, dxSigned) + Math.PI;
          const phase = ((angle / (2 * Math.PI)) * dashCount) % 1;
          if (phase > 0.56) {
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

function drawHalfFilledRoundedTile(
  buf: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  size: number,
  radius: number,
  leftTopColor: RgbaColor,
  leftBottomColor: RgbaColor,
  rightTopColor: RgbaColor,
  rightBottomColor: RgbaColor,
  borderColor: RgbaColor,
  borderWidth: number = 2
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const bx = Math.max(0, size / 2 - radius);
  const by = Math.max(0, size / 2 - radius);

  const minX = Math.max(0, Math.floor(x - 3));
  const maxX = Math.min(width - 1, Math.ceil(x + size + 3));
  const minY = Math.max(0, Math.floor(y - 3));
  const maxY = Math.min(height - 1, Math.ceil(y + size + 3));

  for (let py = minY; py <= maxY; py++) {
    const dySigned = py - cy;
    const dy = Math.abs(dySigned) - by;
    const qy = Math.max(dy, 0);
    const t = clamp01((py - y) / Math.max(1, size));

    const lr = Math.round(leftTopColor.r * (1 - t) + leftBottomColor.r * t);
    const lg = Math.round(leftTopColor.g * (1 - t) + leftBottomColor.g * t);
    const lb = Math.round(leftTopColor.b * (1 - t) + leftBottomColor.b * t);
    const la = (leftTopColor.a * (1 - t) + leftBottomColor.a * t) / 255;

    const rr = Math.round(rightTopColor.r * (1 - t) + rightBottomColor.r * t);
    const rg = Math.round(rightTopColor.g * (1 - t) + rightBottomColor.g * t);
    const rb = Math.round(rightTopColor.b * (1 - t) + rightBottomColor.b * t);
    const ra = (rightTopColor.a * (1 - t) + rightBottomColor.a * t) / 255;

    for (let px = minX; px <= maxX; px++) {
      const dxSigned = px - cx;
      const dx = Math.abs(dxSigned) - bx;
      const qx = Math.max(dx, 0);
      const sd = Math.hypot(qx, qy) + Math.min(Math.max(dx, dy), 0) - radius;
      const idx = (py * width + px) * 4;

      const fillCov = smoothCoverage(sd);
      if (fillCov > 0) {
        const leftWeight = clamp01(0.5 - dxSigned);
        const rightWeight = 1 - leftWeight;
        if (leftWeight > 0 && la > 0) {
          blendPixel(buf, idx, lr, lg, lb, fillCov * la * leftWeight);
        }
        if (rightWeight > 0 && ra > 0) {
          blendPixel(buf, idx, rr, rg, rb, fillCov * ra * rightWeight);
        }
        const dividerCov = smoothCoverage(Math.abs(dxSigned) - Math.max(0.8, size * 0.01));
        if (dividerCov > 0) {
          blendPixel(buf, idx, 255, 255, 255, fillCov * dividerCov * 0.45);
        }
      }

      if (borderColor.a > 0) {
        const halfBw = borderWidth / 2;
        const ringDist = Math.abs(sd + halfBw) - halfBw;
        const ringCov = smoothCoverage(ringDist);
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
  borderWidth: number = 2
): void {
  const minX = Math.max(0, Math.floor(cx - radius - 3));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius + 3));
  const minY = Math.max(0, Math.floor(cy - radius - 3));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius + 3));

  for (let py = minY; py <= maxY; py++) {
    const dy = py - cy;
    const t = clamp01((dy + radius) / (2 * radius));
    const fr = Math.round(topColor.r * (1 - t) + bottomColor.r * t);
    const fg = Math.round(topColor.g * (1 - t) + bottomColor.g * t);
    const fb = Math.round(topColor.b * (1 - t) + bottomColor.b * t);
    const fa = (topColor.a * (1 - t) + bottomColor.a * t) / 255;

    for (let px = minX; px <= maxX; px++) {
      const dx = px - cx;
      const sd = Math.hypot(dx, dy) - radius;
      const idx = (py * width + px) * 4;

      const fillCov = smoothCoverage(sd);
      if (fillCov > 0 && fa > 0) {
        blendPixel(buf, idx, fr, fg, fb, fillCov * fa);
      }

      if (borderColor && borderColor.a > 0) {
        const halfBw = borderWidth / 2;
        const ringDist = Math.abs(sd + halfBw) - halfBw;
        const ringCov = smoothCoverage(ringDist);
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
  width: number,
  height: number,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const stroke = Math.max(1.4, scale * 0.13);
  const p1x = cx - scale * 0.34;
  const p1y = cy + scale * 0.03;
  const p2x = cx - scale * 0.08;
  const p2y = cy + scale * 0.28;
  const p3x = cx + scale * 0.36;
  const p3y = cy - scale * 0.25;

  drawCapsuleLine(buf, width, height, p1x, p1y, p2x, p2y, stroke, color);
  drawCapsuleLine(buf, width, height, p2x, p2y, p3x, p3y, stroke, color);
}

function drawGiftGlyph(
  buf: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const stroke = Math.max(1.0, scale * 0.048);
  const halfW = scale * 0.34;
  const boxHalfW = scale * 0.29;
  const lidTop = cy - scale * 0.08;
  const lidBottom = cy + scale * 0.06;
  const boxTop = lidBottom + stroke * 1.4;
  const boxBottom = cy + scale * 0.36;

  drawRoundedBox(
    buf,
    width,
    height,
    cx - halfW,
    lidTop,
    halfW * 2,
    lidBottom - lidTop,
    Math.max(1.5, scale * 0.045),
    { r: 0, g: 0, b: 0, a: 0 },
    color,
    stroke * 1.8
  );
  drawRoundedBox(
    buf,
    width,
    height,
    cx - boxHalfW,
    boxTop,
    boxHalfW * 2,
    boxBottom - boxTop,
    Math.max(1.5, scale * 0.045),
    { r: 0, g: 0, b: 0, a: 0 },
    color,
    stroke * 1.8
  );
  drawCapsuleLine(
    buf,
    width,
    height,
    cx,
    lidTop + 1,
    cx,
    boxBottom - 1,
    stroke * 0.9,
    color
  );
  drawRing(
    buf,
    width,
    height,
    cx - scale * 0.13,
    lidTop - scale * 0.11,
    scale * 0.095,
    stroke * 0.85,
    color
  );
  drawRing(
    buf,
    width,
    height,
    cx + scale * 0.13,
    lidTop - scale * 0.11,
    scale * 0.095,
    stroke * 0.85,
    color
  );
}

function drawCrownGlyph(
  buf: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  scale: number,
  color: RgbaColor
): void {
  const stroke = Math.max(1.2, scale * 0.085);
  const lx = cx - scale * 0.36;
  const rx = cx + scale * 0.36;
  const topY = cy - scale * 0.28;
  const midY = cy + scale * 0.02;
  const baseY = cy + scale * 0.24;

  drawCapsuleLine(buf, width, height, lx, baseY, lx - scale * 0.06, topY + scale * 0.08, stroke, color);
  drawCapsuleLine(buf, width, height, lx - scale * 0.06, topY + scale * 0.08, cx - scale * 0.16, midY, stroke, color);
  drawCapsuleLine(buf, width, height, cx - scale * 0.16, midY, cx, topY, stroke, color);
  drawCapsuleLine(buf, width, height, cx, topY, cx + scale * 0.16, midY, stroke, color);
  drawCapsuleLine(buf, width, height, cx + scale * 0.16, midY, rx + scale * 0.06, topY + scale * 0.08, stroke, color);
  drawCapsuleLine(buf, width, height, rx + scale * 0.06, topY + scale * 0.08, rx, baseY, stroke, color);
  drawCapsuleLine(buf, width, height, lx, baseY, rx, baseY, stroke, color);
  drawCapsuleLine(buf, width, height, lx, baseY + scale * 0.12, rx, baseY + scale * 0.12, stroke, color);
}

function drawNicheGlyph(
  buf: Uint8Array,
  width: number,
  height: number,
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
  const stroke = Math.max(0.95, scale * 0.045);

  if (key === "coffee" || key === "cafe" || key === "cupsoda") {
    const cupW = scale * 0.50;
    const cupH = scale * 0.42;
    const cupX = cx - cupW * 0.56;
    const cupY = cy - scale * 0.04;
    drawRoundedBox(
      buf,
      width,
      height,
      cupX,
      cupY,
      cupW,
      cupH,
      Math.max(2, scale * 0.1),
      { r: 0, g: 0, b: 0, a: 0 },
      color,
      stroke * 1.85
    );
    drawRing(
      buf,
      width,
      height,
      cupX + cupW + scale * 0.085,
      cupY + cupH * 0.44,
      scale * 0.09,
      stroke * 0.85,
      color
    );
    drawCapsuleLine(
      buf,
      width,
      height,
      cupX - scale * 0.04,
      cupY + cupH + scale * 0.09,
      cupX + cupW + scale * 0.06,
      cupY + cupH + scale * 0.09,
      stroke * 0.9,
      color
    );
    drawCapsuleLine(buf, width, height, cupX + cupW * 0.22, cupY - scale * 0.11, cupX + cupW * 0.22, cupY - scale * 0.23, stroke * 0.8, color);
    drawCapsuleLine(buf, width, height, cupX + cupW * 0.52, cupY - scale * 0.11, cupX + cupW * 0.52, cupY - scale * 0.26, stroke * 0.8, color);
    drawCapsuleLine(buf, width, height, cupX + cupW * 0.82, cupY - scale * 0.11, cupX + cupW * 0.82, cupY - scale * 0.21, stroke * 0.8, color);
    return;
  }

  if (key === "scissors" || key === "barber") {
    drawRing(buf, width, height, cx - scale * 0.24, cy - scale * 0.2, scale * 0.12, stroke * 0.9, color);
    drawRing(buf, width, height, cx - scale * 0.24, cy + scale * 0.2, scale * 0.12, stroke * 0.9, color);
    drawCapsuleLine(buf, width, height, cx - scale * 0.14, cy - scale * 0.14, cx + scale * 0.34, cy + scale * 0.24, stroke * 0.95, color);
    drawCapsuleLine(buf, width, height, cx - scale * 0.14, cy + scale * 0.14, cx + scale * 0.34, cy - scale * 0.24, stroke * 0.95, color);
    return;
  }

  if (key === "heart") {
    const r = scale * 0.16;
    drawGradientCircle(buf, width, height, cx - r * 0.8, cy - scale * 0.08, r, color, color);
    drawGradientCircle(buf, width, height, cx + r * 0.8, cy - scale * 0.08, r, color, color);
    drawCapsuleLine(buf, width, height, cx - r * 1.4, cy - scale * 0.02, cx, cy + scale * 0.28, r * 0.85, color);
    drawCapsuleLine(buf, width, height, cx + r * 1.4, cy - scale * 0.02, cx, cy + scale * 0.28, r * 0.85, color);
    return;
  }

  if (key === "crown" || key === "vip") {
    drawCrownGlyph(buf, width, height, cx, cy, scale, color);
    return;
  }

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
    drawCapsuleLine(buf, width, height, a.x, a.y, b.x, b.y, stroke * 0.85, color);
  }
}

/**
 * Renders a rounded-square visual stamp strip matching the browser pass UI
 * for Google Wallet heroImage (1032x336) and Apple Wallet storeCard strips (375x144 / 750x288 / 1125x432).
 */
export function renderStampsStripPng(options: StampStripRenderOptions): Buffer {
  const width = Math.max(200, Math.min(2000, Math.round(options.width ?? DEFAULT_IMAGE_WIDTH)));
  const height = Math.max(80, Math.min(1000, Math.round(options.height ?? DEFAULT_IMAGE_HEIGHT)));
  const unitScale = width / DEFAULT_IMAGE_WIDTH;

  const rgba = new Uint8Array(width * height * 4);
  const baseRgb = parseHexRgb(options.primaryColor);
  fillBackgroundGradient(rgba, width, height, baseRgb);

  const trayX = Math.round(width * 0.042);
  const trayY = Math.round(height * 0.072);
  const trayW = width - trayX * 2;
  const trayH = height - trayY * 2;

  const trayBorder: RgbaColor = options.isVip
    ? { r: 251, g: 191, b: 36, a: 150 }
    : { r: 255, g: 255, b: 255, a: 55 };

  drawRoundedBox(
    rgba,
    width,
    height,
    trayX,
    trayY,
    trayW,
    trayH,
    Math.max(10, Math.round(28 * unitScale)),
    { r: 0, g: 0, b: 0, a: 74 },
    trayBorder,
    Math.max(1.2, 2 * unitScale)
  );

  // Cashback / VIP bar mode
  if (options.isCashback) {
    const badgeRadius = Math.min(trayH * 0.24, 56 * unitScale);
    const badgeCx = trayX + badgeRadius + 36 * unitScale;
    const badgeCy = height / 2;

    if (options.isVip) {
      drawGradientCircle(
        rgba,
        width,
        height,
        badgeCx,
        badgeCy,
        badgeRadius,
        { r: 252, g: 211, b: 77, a: 255 },
        { r: 245, g: 158, b: 11, a: 255 },
        { r: 254, g: 243, b: 199, a: 255 },
        Math.max(1.5, 3 * unitScale)
      );
      drawCrownGlyph(rgba, width, height, badgeCx, badgeCy, badgeRadius, {
        r: 17,
        g: 24,
        b: 39,
        a: 255,
      });
    } else {
      drawGradientCircle(
        rgba,
        width,
        height,
        badgeCx,
        badgeCy,
        badgeRadius,
        { r: 52, g: 211, b: 153, a: 255 },
        { r: 5, g: 150, b: 105, a: 255 },
        { r: 167, g: 243, b: 208, a: 255 },
        Math.max(1.5, 3 * unitScale)
      );
      drawGiftGlyph(rgba, width, height, badgeCx, badgeCy, badgeRadius, {
        r: 255,
        g: 255,
        b: 255,
        a: 255,
      });
    }

    const segments = 8;
    const barStartX = badgeCx + badgeRadius + 32 * unitScale;
    const barEndX = trayX + trayW - 36 * unitScale;
    const gap = 14 * unitScale;
    const segW = Math.max(8, (barEndX - barStartX - gap * (segments - 1)) / segments);
    const segH = Math.max(14, Math.min(trayH * 0.22, 44 * unitScale));
    const segY = height / 2 - segH / 2;

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
        width,
        height,
        barStartX + i * (segW + gap),
        segY,
        segW,
        segH,
        Math.max(4, segH * 0.42),
        isActive
          ? { r: 251, g: 191, b: 36, a: 255 }
          : { r: 255, g: 255, b: 255, a: 36 },
        isActive
          ? { r: 254, g: 243, b: 199, a: 255 }
          : { r: 255, g: 255, b: 255, a: 50 },
        Math.max(1, 2 * unitScale)
      );
    }

    return encodeRgbaToPng(width, height, rgba);
  }

  // Stamps Grid Layout (1 row for <=5 stamps, 2 rows of up to 5 tiles for 6..20 stamps)
  const totalRequired = Math.max(1, Math.min(20, options.stampsRequired || 5));
  const earnedCount = options.isActivated
    ? Math.max(0, Math.min(totalRequired, options.stamps || 0))
    : 0;

  const useTwoRows = totalRequired > 5;
  const firstRowCount = useTwoRows ? Math.ceil(totalRequired / 2) : totalRequired;
  const secondRowCount = useTwoRows ? totalRequired - firstRowCount : 0;

  const innerPadX = trayW * 0.05;
  const innerPadY = trayH * 0.1;
  const usableW = trayW - innerPadX * 2;
  const usableH = trayH - innerPadY * 2;
  const rowCount = useTwoRows ? 2 : 1;
  const gapRatio = 0.22;
  const maxCols = Math.max(firstRowCount, secondRowCount, 1);

  const maxTileW = usableW / (maxCols + (maxCols - 1) * gapRatio);
  const maxTileH =
    rowCount === 2 ? usableH / (2 + 0.16) : usableH * 0.78;
  const tileSize = Math.max(20, Math.min(maxTileW, maxTileH, trayH * 0.72));
  const gap = tileSize * gapRatio;
  const rowGap = rowCount === 2 ? tileSize * 0.16 : 0;
  const tileRadius = Math.max(5, tileSize * 0.24);
  const tileBorderW = Math.max(1.2, tileSize * 0.028);

  const rows: number[][] = [Array.from({ length: firstRowCount }, (_, i) => i)];
  if (secondRowCount > 0) {
    rows.push(Array.from({ length: secondRowCount }, (_, i) => firstRowCount + i));
  }

  const totalRowsHeight = rows.length * tileSize + (rows.length - 1) * rowGap;
  const startTopY = height / 2 - totalRowsHeight / 2;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const rowWidth = row.length * tileSize + (row.length - 1) * gap;
    const startLeftX = width / 2 - rowWidth / 2;
    const tileY = startTopY + rowIdx * (tileSize + rowGap);
    const cy = tileY + tileSize / 2;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const slotIndex = row[colIdx];
      const tileX = startLeftX + colIdx * (tileSize + gap);
      const cx = tileX + tileSize / 2;
      const slotFill = clamp01(earnedCount - slotIndex);
      const isCollected = slotFill >= 0.99;
      const isHalfCollected = !isCollected && slotFill >= 0.25;
      const isGiftSlot = slotIndex === totalRequired - 1;

      if (isGiftSlot) {
        if (isCollected) {
          drawGradientRoundedTile(
            rgba,
            width,
            height,
            tileX,
            tileY,
            tileSize,
            tileRadius,
            { r: 252, g: 211, b: 77, a: 255 },
            { r: 245, g: 158, b: 11, a: 255 },
            { r: 254, g: 243, b: 199, a: 255 },
            tileBorderW * 1.15
          );
          drawGiftGlyph(rgba, width, height, cx, cy, tileSize * 0.56, {
            r: 17,
            g: 24,
            b: 39,
            a: 255,
          });
        } else if (isHalfCollected) {
          drawHalfFilledRoundedTile(
            rgba,
            width,
            height,
            tileX,
            tileY,
            tileSize,
            tileRadius,
            { r: 252, g: 211, b: 77, a: 255 },
            { r: 245, g: 158, b: 11, a: 255 },
            { r: 0, g: 0, b: 0, a: 95 },
            { r: 0, g: 0, b: 0, a: 120 },
            { r: 253, g: 224, b: 71, a: 245 },
            tileBorderW
          );
          drawGiftGlyph(rgba, width, height, cx, cy, tileSize * 0.56, {
            r: 255,
            g: 255,
            b: 255,
            a: 245,
          });
        } else {
          drawGradientRoundedTile(
            rgba,
            width,
            height,
            tileX,
            tileY,
            tileSize,
            tileRadius,
            { r: 0, g: 0, b: 0, a: 95 },
            { r: 0, g: 0, b: 0, a: 120 },
            { r: 251, g: 191, b: 36, a: 235 },
            tileBorderW,
            true
          );
          drawGiftGlyph(rgba, width, height, cx, cy, tileSize * 0.56, {
            r: 252,
            g: 211,
            b: 77,
            a: 255,
          });
        }
        continue;
      }

      if (isCollected) {
        drawGradientRoundedTile(
          rgba,
          width,
          height,
          tileX,
          tileY,
          tileSize,
          tileRadius,
          { r: 16, g: 185, b: 129, a: 255 },
          { r: 5, g: 150, b: 105, a: 255 },
          { r: 167, g: 243, b: 208, a: 255 },
          tileBorderW * 1.1
        );
        drawCheckGlyph(rgba, width, height, cx, cy, tileSize * 0.56, {
          r: 255,
          g: 255,
          b: 255,
          a: 255,
        });
      } else if (isHalfCollected) {
        drawHalfFilledRoundedTile(
          rgba,
          width,
          height,
          tileX,
          tileY,
          tileSize,
          tileRadius,
          { r: 16, g: 185, b: 129, a: 255 },
          { r: 5, g: 150, b: 105, a: 255 },
          { r: 0, g: 0, b: 0, a: 86 },
          { r: 0, g: 0, b: 0, a: 112 },
          { r: 167, g: 243, b: 208, a: 235 },
          tileBorderW
        );
        drawNicheGlyph(
          rgba,
          width,
          height,
          options.iconOrNiche,
          cx,
          cy,
          tileSize * 0.54,
          { r: 255, g: 255, b: 255, a: 235 }
        );
      } else {
        drawGradientRoundedTile(
          rgba,
          width,
          height,
          tileX,
          tileY,
          tileSize,
          tileRadius,
          { r: 0, g: 0, b: 0, a: 84 },
          { r: 0, g: 0, b: 0, a: 108 },
          { r: 255, g: 255, b: 255, a: 64 },
          Math.max(1, tileBorderW * 0.85)
        );
        drawNicheGlyph(
          rgba,
          width,
          height,
          options.iconOrNiche,
          cx,
          cy,
          tileSize * 0.54,
          { r: 255, g: 255, b: 255, a: 165 }
        );
      }
    }
  }

  return encodeRgbaToPng(width, height, rgba);
}
