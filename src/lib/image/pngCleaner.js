import { normalizeToPNG } from "./png";

const SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const PRESERVE = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "iCCP", "sBIT", "bKGD"]);

function readU32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false);
}
function writeU32(bytes, offset, value) {
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(offset, value, false);
}
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function makeChunk(type, data) {
  const typeBytes = encoder.encode(type);
  const body = new Uint8Array(typeBytes.length + data.length);
  body.set(typeBytes); body.set(data, 4);
  const chunk = new Uint8Array(data.length + 12);
  writeU32(chunk, 0, data.length);
  chunk.set(body, 4);
  writeU32(chunk, data.length + 8, crc32(body));
  return chunk;
}
function parse(bytes) {
  if (bytes.length < 33 || !SIGNATURE.every((v, i) => bytes[i] === v)) throw new Error("The normalized image is not a valid PNG.");
  const chunks = [];
  let offset = 8;
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error("PNG contains a truncated chunk.");
    const type = decoder.decode(bytes.subarray(offset + 4, offset + 8));
    const body = bytes.subarray(offset + 4, offset + 8 + length);
    const expected = readU32(bytes, offset + 8 + length);
    if (crc32(body) !== expected) throw new Error(`PNG integrity check failed for ${type}.`);
    chunks.push({ type, bytes: bytes.slice(offset, end), length });
    offset = end;
    if (type === "IEND") { ended = true; break; }
  }
  if (!ended) throw new Error("PNG is missing its end marker.");
  return chunks;
}

export const METADATA_CHUNK_GROUPS = {
  camera: ["eXIf"],
  text: ["tEXt", "zTXt", "iTXt"],
  dates: ["tIME"],
  physical: ["pHYs"],
  color: ["iCCP", "gAMA", "cHRM", "sRGB", "sBIT"],
  other: [],
};

function getChunkKeyword(bytes, type) {
  if (!["tEXt", "zTXt", "iTXt"].includes(type)) return "";
  const data = bytes.subarray(8, bytes.length - 4);
  const end = data.indexOf(0);
  return end < 0 ? "" : decoder.decode(data.subarray(0, end));
}

export async function inspectPNGChunks(file) {
  const normalized = file.type === "image/png" ? { blob: file } : await normalizeToPNG(file);
  const bytes = new Uint8Array(await normalized.blob.arrayBuffer());
  const chunks = parse(bytes);
  return chunks.map(({ type, length, bytes: chunkBytes }, index) => ({
    id: `${type}:${index}`,
    type, length,
    keyword: getChunkKeyword(chunkBytes, type),
    description: ({
      eXIf: "EXIF camera and capture metadata",
      tEXt: "Uncompressed text metadata",
      zTXt: "Compressed text metadata",
      iTXt: "International text metadata",
      tIME: "Image modification timestamp",
      pHYs: "Physical pixel dimensions",
      iCCP: "Embedded colour profile",
      gAMA: "Gamma information",
      cHRM: "Chromaticity information",
      sRGB: "Standard RGB colour information",
    })[type] || (PRESERVE.has(type) ? "Image rendering data" : "Additional PNG information"),
  }));
}

/**
 * Removes only selected metadata chunks. Pixel payload bits are never touched here.
 * selectedChunks is an array of exact PNG chunk names. "all" removes removable
 * ancillary chunks while retaining rendering-critical colour and transparency chunks.
 */
export async function cleanPNGMetadata(file, { selectedChunks = [], selectedChunkIds = [] } = {}) {
  const sourceFormat = file.type || "unknown";
  const normalizedBlob = file.type === "image/png" ? file : (await normalizeToPNG(file)).blob;
  const bytes = new Uint8Array(await normalizedBlob.arrayBuffer());
  const chunks = parse(bytes);
  const allMode = selectedChunks.includes("all");
  const selected = new Set(selectedChunks);
  const selectedIds = new Set(selectedChunkIds);
  const output = [SIGNATURE];
  const removed = [];
  const preserved = [];

  for (const [index, chunk] of chunks.entries()) {
    const ancillary = (chunk.type.charCodeAt(0) & 32) !== 0;
    const chunkId = `${chunk.type}:${index}`;
    const explicitSelection = selectedIds.has(chunkId) || selected.has(chunk.type);
    const isSelected = explicitSelection || (allMode && ancillary && !PRESERVE.has(chunk.type));
    const critical = !ancillary;
    if (isSelected && ancillary && (explicitSelection || !PRESERVE.has(chunk.type))) removed.push(chunk.type);
    else {
      output.push(chunk.bytes);
      preserved.push(chunk.type);
    }
    if (critical && isSelected) preserved.push(chunk.type);
  }

  const total = output.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const part of output) { result.set(part, offset); offset += part.length; }

  return {
    blob: new Blob([result], { type: "image/png" }),
    removed,
    preserved,
    payloadRemoved: false,
    clearedBytes: 0,
    sourceFormat,
    outputFormat: "PNG",
    note: sourceFormat !== "image/png"
      ? "The source image was normalized to PNG. Metadata that the browser decoder did not carry into the PNG cannot be selectively recovered."
      : "Only the selected PNG metadata chunks were removed. Hidden pixel payload data was left unchanged.",
  };
}
