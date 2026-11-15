
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

// Chunks that can affect image rendering and should be preserved.
const PRESERVE_CHUNKS = new Set([
  "IHDR",
  "PLTE",
  "IDAT",
  "IEND",
  "tRNS",
  "gAMA",
  "cHRM",
  "sRGB",
  "iCCP",
  "sBIT",
  "bKGD",
]);

function readUint32(bytes, offset) {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint32(offset, false);
}

function writeUint32(bytes, offset, value) {
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).setUint32(
    offset,
    value,
    false,
  );
}

// CRC-32 used by PNG chunks.
const crcTable = (() => {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n++) {
    let c = n;

    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }

    table[n] = c >>> 0;
  }

  return table;
})();

function calculateCRC(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function verifyCRC(bytes, offset, length) {
  const expected = readUint32(bytes, offset + 8 + length);

  const actual = calculateCRC(bytes.subarray(offset + 4, offset + 8 + length));

  return expected === actual;
}

export async function cleanPNGMetadata(file) {
  if (!file || file.type !== "image/png") {
    throw new Error("Please select a PNG image.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (
    bytes.length < 33 ||
    !PNG_SIGNATURE.every((value, index) => bytes[index] === value)
  ) {
    throw new Error("Invalid PNG image.");
  }

  const output = [PNG_SIGNATURE];
  const removed = [];
  const preserved = [];

  let offset = 8;
  let ended = false;
  let seenIHDR = false;
  let seenIDAT = false;
  let endedIDAT = false;

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new Error("PNG contains a truncated chunk.");
    }

    const length = readUint32(bytes, offset);

    if (length > bytes.length - offset - 12) {
      throw new Error("PNG contains an invalid chunk length.");
    }

    const type = new TextDecoder().decode(
      bytes.subarray(offset + 4, offset + 8),
    );

    const end = offset + 12 + length;

    if (type === "IHDR") {
      if (seenIHDR || offset !== 8 || length !== 13) {
        throw new Error("Invalid PNG header.");
      }
      seenIHDR = true;
    }

    if (type === "IDAT") {
      seenIDAT = true;
    } else if (seenIDAT && type !== "IDAT") {
      endedIDAT = true;
    }

    if (type === "IEND") {
      if (length !== 0 || !seenIHDR || !seenIDAT) {
        throw new Error("Invalid PNG ending.");
      }
      ended = true;
    }

    if (!verifyCRC(bytes, offset, length)) {
      throw new Error(`PNG CRC verification failed: ${type}`);
    }

    const keep = PRESERVE_CHUNKS.has(type);

    if (keep) {
      output.push(bytes.subarray(offset, end));
      preserved.push(type);
    } else {
      // Do not remove critical chunks or unknown critical data.
      const critical = (type.charCodeAt(0) & 32) === 0;

      if (critical) {
        output.push(bytes.subarray(offset, end));
        preserved.push(type);
      } else {
        removed.push(type);
      }
    }

    offset = end;

    if (ended) break;
  }

  if (!ended || !seenIDAT || offset !== bytes.length) {
    throw new Error("Invalid PNG structure or unexpected trailing data.");
  }

  // A PNG cannot have non-consecutive IDAT chunks.
  if (endedIDAT && preserved.length === 0) {
    throw new Error("Invalid image data sequence.");
  }

  const totalLength = output.reduce((sum, part) => sum + part.length, 0);

  const result = new Uint8Array(totalLength);

  let cursor = 0;

  for (const part of output) {
    result.set(part, cursor);
    cursor += part.length;
  }

  const metadataCleanedBlob = new Blob([result], {
    type: "image/png",
  });

  // Metadata cleanup is deliberately independent from hidden-payload cleanup.
  // LSB payload bits are left untouched; use the separate Payload Cleaner for that.
  return {
    blob: metadataCleanedBlob,
    removed,
    preserved,
    payloadRemoved: false,
    clearedBytes: 0,
  };
}
