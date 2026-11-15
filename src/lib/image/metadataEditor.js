const SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function readU32(b, o) { return new DataView(b.buffer, b.byteOffset, b.byteLength).getUint32(o, false); }
function writeU32(b, o, v) { new DataView(b.buffer, b.byteOffset, b.byteLength).setUint32(o, v, false); }
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) { out.set(part, offset); offset += part.length; }
  return out;
}
function makeChunk(type, data) {
  const typeBytes = encoder.encode(type);
  const body = concat([typeBytes, data]);
  const chunk = new Uint8Array(data.length + 12);
  writeU32(chunk, 0, data.length);
  chunk.set(body, 4);
  writeU32(chunk, data.length + 8, crc32(body));
  return chunk;
}
function parse(bytes) {
  if (!SIGNATURE.every((v, i) => bytes[i] === v)) throw new Error("Editor expects a PNG image.");
  const chunks = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error("PNG contains a damaged chunk.");
    const type = decoder.decode(bytes.subarray(offset + 4, offset + 8));
    chunks.push({ type, bytes: bytes.slice(offset, end) });
    offset = end;
    if (type === "IEND") return chunks;
  }
  throw new Error("PNG end marker was not found.");
}
const FIELDS = {
  Title: "Title",
  Author: "Author",
  Description: "Description",
  Copyright: "Copyright",
  Software: "Software",
  Comment: "Comment",
};
function keywordFromChunk(chunk) {
  if (!["tEXt", "zTXt", "iTXt"].includes(chunk.type)) return "";
  const data = chunk.bytes.subarray(8, chunk.bytes.length - 4);
  const split = data.indexOf(0);
  return split < 0 ? "" : decoder.decode(data.subarray(0, split));
}
export async function writePNGMetadata(file, values) {
  const chunks = parse(new Uint8Array(await file.arrayBuffer()));
  const fields = Object.entries(values).filter(([key, value]) => FIELDS[key] && String(value ?? "").trim());
  const fieldNames = new Set(fields.map(([key]) => FIELDS[key]));
  const retained = chunks.filter((chunk) => !fieldNames.has(keywordFromChunk(chunk)));
  const additions = fields.map(([key, value]) => {
    const keyword = encoder.encode(FIELDS[key]);
    const text = encoder.encode(String(value));
    // iTXt supports UTF-8 text and international characters.
    const data = concat([
      keyword,
      new Uint8Array([0, 0, 0, 0, 0]),
      text,
    ]);
    return makeChunk("iTXt", data);
  });
  const output = [SIGNATURE];
  for (const chunk of retained) {
    if (chunk.type === "IEND") output.push(...additions);
    output.push(chunk.bytes);
  }
  return new Blob([concat(output)], { type: "image/png" });
}
