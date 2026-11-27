"use client";

import QRCode from "qrcode";
import { getStandUrl } from "@/lib/urls";

const TEMPLATE_URL = "/stand-poster-template.png?v=1";
const BASE_WIDTH = 1024;
const BASE_HEIGHT = 1536;

/**
 * Exact pixel geometry measured from Walinx NFC Scan Loyalty Poster.png (1024x1536):
 * - White center QR frame interior: x=[183..828], y=[522..1187] -> center (505.5, 854.5)
 * - Bottom black bar interior:      x=[218..805], y=[1388..1471] -> center (511.5, 1429.5)
 */
const QR_CENTER_X = 505.5;
const QR_CENTER_Y = 854.5;
const QR_BOX_SIZE = 560; // Leaves ~43px-53px quiet zone inside the orange rounded frame
const PILL_CENTER_X = 511.5;
const PILL_CENTER_Y = 1430.5;
const PILL_TEXT = "walink.ma";

interface ZipEntryInput {
  filename: string;
  data: Uint8Array;
}

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 1) !== 0 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Zero-dependency Stored ZIP builder (CRC32 + STORE method 0, ideal for already-compressed PNGs).
 */
export function createStoredZipBlob(entries: ZipEntryInput[]): Blob {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.filename);
    const data = entry.data;
    const crc = computeCrc32(data);

    // Local File Header (30 bytes + filename)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const ldv = new DataView(localHeader.buffer);
    ldv.setUint32(0, 0x04034b50, true);
    ldv.setUint16(4, 20, true); // Version needed
    ldv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    ldv.setUint16(8, 0, true); // Compression method: 0 = STORE
    ldv.setUint16(10, dosTime, true);
    ldv.setUint16(12, dosDate, true);
    ldv.setUint32(14, crc, true);
    ldv.setUint32(18, data.length, true);
    ldv.setUint32(22, data.length, true);
    ldv.setUint16(26, nameBytes.length, true);
    ldv.setUint16(28, 0, true); // Extra length
    localHeader.set(nameBytes, 30);

    localChunks.push(localHeader, data);

    // Central Directory Header (46 bytes + filename)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(centralHeader.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0x0800, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, dosTime, true);
    cdv.setUint16(14, dosDate, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, data.length, true);
    cdv.setUint32(24, data.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true);
    cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true);
    cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralChunks.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  let centralSize = 0;
  for (const chunk of centralChunks) {
    centralSize += chunk.length;
  }

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(4, 0, true);
  edv.setUint16(6, 0, true);
  edv.setUint16(8, entries.length, true);
  edv.setUint16(10, entries.length, true);
  edv.setUint32(12, centralSize, true);
  edv.setUint32(16, offset, true);
  edv.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localChunks.map((part) => Uint8Array.from(part)),
    ...centralChunks.map((part) => Uint8Array.from(part)),
    Uint8Array.from(eocd),
  ];

  return new Blob(blobParts, { type: "application/zip" });
}

let cachedTemplatePromise: Promise<HTMLImageElement> | null = null;

function loadStandTemplate(): Promise<HTMLImageElement> {
  if (cachedTemplatePromise) {
    return cachedTemplatePromise;
  }

  cachedTemplatePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        if (typeof img.decode === "function") {
          await img.decode();
        }
      } catch {
        // Proceed with loaded natural dimensions
      }
      resolve(img);
    };
    img.onerror = () => {
      cachedTemplatePromise = null;
      reject(new Error("تعذر تحميل قالب ستاند الكاونتر للطباعة."));
    };
    img.src = TEMPLATE_URL;
  });

  return cachedTemplatePromise;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("تعذر تحويل بوستر الستاند إلى ملف PNG."));
          return;
        }
        resolve(blob);
      },
      "image/png",
      1
    );
  });
}

async function drawPosterFrame(
  ctx: CanvasRenderingContext2D,
  qrCanvas: HTMLCanvasElement,
  templateImg: HTMLImageElement,
  standCode: string,
  scale: number
): Promise<void> {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  const qrSize = Math.round(QR_BOX_SIZE * scale);
  const qrX = Math.round(QR_CENTER_X * scale - qrSize / 2);
  const qrY = Math.round(QR_CENTER_Y * scale - qrSize / 2);

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(templateImg, 0, 0, width, height);

  // Render crisp ErrorCorrection H QR directly onto reusable QR canvas
  qrCanvas.width = qrSize;
  qrCanvas.height = qrSize;
  await QRCode.toCanvas(qrCanvas, getStandUrl(standCode), {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: "H",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Draw crisp centered "walink.ma" inside the bottom black bar
  ctx.save();
  ctx.direction = "ltr";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${Math.round(36 * scale)}px "Plus Jakarta Sans", "Inter", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(PILL_TEXT, PILL_CENTER_X * scale, PILL_CENTER_Y * scale);
  ctx.restore();
}

/**
 * Generates a high-resolution print-ready PNG Blob (2048x3072) for a single stand code.
 */
export async function renderStandPosterBlob(standCode: string): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  const templateImg = await loadStandTemplate();
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = BASE_WIDTH * scale;
  canvas.height = BASE_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }
  const qrCanvas = document.createElement("canvas");

  await drawPosterFrame(ctx, qrCanvas, templateImg, standCode, scale);
  return canvasToBlob(canvas);
}

/**
 * Generates a lightweight composite preview Data URL (1024x1536) for the Print/PDF preview modal.
 */
export async function renderStandPosterPreviewDataUrl(
  standCode: string
): Promise<string> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  const templateImg = await loadStandTemplate();
  const scale = 1;
  const canvas = document.createElement("canvas");
  canvas.width = BASE_WIDTH * scale;
  canvas.height = BASE_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }
  const qrCanvas = document.createElement("canvas");

  await drawPosterFrame(ctx, qrCanvas, templateImg, standCode, scale);
  return canvas.toDataURL("image/png");
}

/**
 * Reuses a single 2048x3072 offscreen canvas and builds a print-ready Stored ZIP for all codes.
 */
export async function generateBatchStandPostersZip(
  standCodes: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  const templateImg = await loadStandTemplate();
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = BASE_WIDTH * scale;
  canvas.height = BASE_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }
  const qrCanvas = document.createElement("canvas");

  const entries: ZipEntryInput[] = [];
  const total = standCodes.length;

  for (let i = 0; i < total; i += 1) {
    const code = standCodes[i];
    await drawPosterFrame(ctx, qrCanvas, templateImg, code, scale);
    const pngBlob = await canvasToBlob(canvas);
    const bytes = new Uint8Array(await pngBlob.arrayBuffer());
    entries.push({
      filename: `walink-poster-${code}.png`,
      data: bytes,
    });
    onProgress?.(i + 1, total);
    // Yield briefly so the UI progress indicator animates smoothly
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  }

  return createStoredZipBlob(entries);
}
