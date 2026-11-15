const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
export const CIPHER_KEY_LABEL = "CIPHER_SECRET_KEY";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function concat(parts) {
  const total = parts.reduce((n, part) => n + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function readU32(bytes, offset) {
  return (
    bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3]
  );
}

function u32(value) {
  return new Uint8Array([
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = encoder.encode(type);
  const body = concat([typeBytes, data]);
  return concat([u32(data.length), body, u32(crc32(body))]);
}

function parseChunks(bytes) {
  if (bytes.length < 8 || !PNG_SIGNATURE.every((v, i) => bytes[i] === v)) {
    throw new Error("The selected file is not a valid PNG.");
  }

  const chunks = [];
  let offset = 8;
  let ended = false;

  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error("The PNG contains an incomplete chunk.");

    const typeBytes = bytes.slice(offset + 4, offset + 8);
    const data = bytes.slice(offset + 8, offset + 8 + length);
    const expectedCRC = readU32(bytes, offset + 8 + length);
    const actualCRC = crc32(bytes.slice(offset + 4, offset + 8 + length));
    if (expectedCRC !== actualCRC) {
      throw new Error(`PNG chunk ${decoder.decode(typeBytes)} failed CRC validation.`);
    }

    const type = decoder.decode(typeBytes);
    chunks.push({ type, data });
    offset = end;

    if (type === "IEND") {
      ended = true;
      break;
    }
  }

  if (!ended) throw new Error("The PNG is missing its IEND chunk.");
  if (offset !== bytes.length) {
    // Trailing bytes are not part of a normal PNG datastream. Preserve none.
  }
  return chunks;
}

function getKeyword(data) {
  const separator = data.indexOf(0);
  return separator < 0 ? "" : decoder.decode(data.slice(0, separator));
}

function makeITxtData(value) {
  return concat([
    encoder.encode(CIPHER_KEY_LABEL),
    // keyword terminator, compression flag, compression method,
    // empty language tag, empty translated keyword
    new Uint8Array([0, 0, 0, 0, 0]),
    encoder.encode(value),
  ]);
}

function readITxt(data) {
  const keywordEnd = data.indexOf(0);
  if (keywordEnd < 0 || decoder.decode(data.slice(0, keywordEnd)) !== CIPHER_KEY_LABEL) {
    return null;
  }

  let offset = keywordEnd + 1;
  const compressionFlag = data[offset++];
  const compressionMethod = data[offset++];

  // This implementation writes uncompressed UTF-8 iTXt fields.
  if (compressionFlag !== 0 || compressionMethod !== 0) return null;

  const languageEnd = data.indexOf(0, offset);
  if (languageEnd < 0) return null;
  offset = languageEnd + 1;

  const translatedEnd = data.indexOf(0, offset);
  if (translatedEnd < 0) return null;
  offset = translatedEnd + 1;

  return decoder.decode(data.slice(offset));
}

function isCipherKeyChunk(chunk) {
  return (chunk.type === "iTXt" || chunk.type === "tEXt") &&
    getKeyword(chunk.data) === CIPHER_KEY_LABEL;
}

/**
 * Adds/replaces the fixed CIPHER_SECRET_KEY iTXt field.
 * The key is stored in plaintext metadata. Only call after explicit opt-in.
 */
export async function embedCipherKey(fileOrBlob, secretKey) {
  if (fileOrBlob.type && fileOrBlob.type !== "image/png") {
    throw new Error("CIPHER key metadata is currently supported for PNG files only. The original format will not be converted.");
  }
  const key = String(secretKey ?? "").trim();
  if (!key) throw new Error("A non-empty secret key is required.");

  const bytes = new Uint8Array(await fileOrBlob.arrayBuffer());
  const chunks = parseChunks(bytes).filter((chunk) => !isCipherKeyChunk(chunk));
  const metadataChunk = { type: "iTXt", data: makeITxtData(key) };

  const outputChunks = [];
  let inserted = false;

  for (const chunk of chunks) {
    if (chunk.type === "IEND" && !inserted) {
      outputChunks.push(metadataChunk);
      inserted = true;
    }
    outputChunks.push(chunk);
  }

  if (!inserted) throw new Error("Could not locate the PNG end chunk.");

  return new Blob(
    [PNG_SIGNATURE, ...outputChunks.map(({ type, data }) => makeChunk(type, data))],
    { type: "image/png" }
  );
}

/** Returns the key stored in CIPHER_SECRET_KEY, or null when absent/unreadable. */
export async function extractCipherKey(fileOrBlob) {
  if (fileOrBlob.type && fileOrBlob.type !== "image/png") return null;
  const bytes = new Uint8Array(await fileOrBlob.arrayBuffer());
  const chunks = parseChunks(bytes);

  for (const chunk of chunks) {
    if (chunk.type === "iTXt") {
      const key = readITxt(chunk.data);
      if (key?.trim()) return key.trim();
    }

    // Read older uncompressed tEXt versions too.
    if (chunk.type === "tEXt" && isCipherKeyChunk(chunk)) {
      const separator = chunk.data.indexOf(0);
      const value = decoder.decode(chunk.data.slice(separator + 1));
      if (value.trim()) return value.trim();
    }
  }

  return null;
}

/** Removes only CIPHER_SECRET_KEY metadata; leaves unrelated metadata intact. */
export async function removeCipherKey(fileOrBlob) {
  const bytes = new Uint8Array(await fileOrBlob.arrayBuffer());
  const chunks = parseChunks(bytes).filter((chunk) => !isCipherKeyChunk(chunk));

  return new Blob(
    [PNG_SIGNATURE, ...chunks.map(({ type, data }) => makeChunk(type, data))],
    { type: "image/png" }
  );
}
