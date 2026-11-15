
const MAGIC = new Uint8Array([67, 80, 72, 82]); // CPHR
const VERSION = 1;

const HEADER_SIZE = 37;
const MAX_PAYLOAD_SIZE = 64 * 1024 * 1024;

function getCapacity(imageData) {
  return Math.floor(
    (imageData.width * imageData.height * 3) / 8
  );
}

function createPayload(encrypted) {
  const payload = new Uint8Array(
    HEADER_SIZE + encrypted.ciphertext.length
  );

  payload.set(MAGIC, 0);
  payload[4] = VERSION;

  payload.set(encrypted.salt, 5);
  payload.set(encrypted.iv, 21);

  const view = new DataView(payload.buffer);

  view.setUint32(
    33,
    encrypted.ciphertext.length,
    false
  );

  payload.set(encrypted.ciphertext, HEADER_SIZE);

  return payload;
}

function readBytes(imageData, byteCount) {
  const output = new Uint8Array(byteCount);
  const pixels = imageData.data;

  for (let byteIndex = 0; byteIndex < byteCount; byteIndex++) {
    let value = 0;

    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      const channelIndex = byteIndex * 8 + bitIndex;

      const pixelIndex =
        Math.floor(channelIndex / 3) * 4 +
        (channelIndex % 3);

      const bit = pixels[pixelIndex] & 1;

      value = (value << 1) | bit;
    }

    output[byteIndex] = value;
  }

  return output;
}

function writeBytes(imageData, bytes) {
  const pixels = imageData.data;
  const requiredBits = bytes.length * 8;
  const availableBits =
    imageData.width * imageData.height * 3;

  if (requiredBits > availableBits) {
    throw new Error("Image does not have enough capacity.");
  }

  for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
    for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
      const channelIndex = byteIndex * 8 + bitIndex;

      const pixelIndex =
        Math.floor(channelIndex / 3) * 4 +
        (channelIndex % 3);

      const shift = 7 - bitIndex;

      const bit = (bytes[byteIndex] >> shift) & 1;

      pixels[pixelIndex] =
        (pixels[pixelIndex] & 0xfe) | bit;
    }
  }
}

export function embedPayload(imageData, encrypted) {
  const payload = createPayload(encrypted);

  if (payload.length > getCapacity(imageData)) {
    throw new Error(
      "Image is too small for this message. Choose a larger PNG."
    );
  }

  writeBytes(imageData, payload);

  return imageData;
}

export function extractPayload(imageData) {
  const capacity = getCapacity(imageData);

  if (capacity < HEADER_SIZE) {
    throw new Error("Image is too small to contain a CIPHER payload.");
  }

  const header = readBytes(imageData, HEADER_SIZE);

  for (let i = 0; i < MAGIC.length; i++) {
    if (header[i] !== MAGIC[i]) {
      throw new Error(
        "No valid CIPHER payload was found in this image."
      );
    }
  }

  if (header[4] !== VERSION) {
    throw new Error("Unsupported CIPHER payload version.");
  }

  const view = new DataView(
    header.buffer,
    header.byteOffset,
    header.byteLength
  );

  const ciphertextLength = view.getUint32(33, false);

  if (
    ciphertextLength < 16 ||
    ciphertextLength > MAX_PAYLOAD_SIZE ||
    HEADER_SIZE + ciphertextLength > capacity
  ) {
    throw new Error("Invalid or corrupted CIPHER payload.");
  }

  const fullPayload = readBytes(
    imageData,
    HEADER_SIZE + ciphertextLength
  );

  return {
    salt: fullPayload.slice(5, 21),
    iv: fullPayload.slice(21, 33),
    ciphertext: fullPayload.slice(HEADER_SIZE),
  };
}


export function clearPayload(imageData) {
  // First validate that this image contains a valid CIPHER payload.
  const payload = extractPayload(imageData);

  const totalBytes = HEADER_SIZE + payload.ciphertext.length;
  const totalBits = totalBytes * 8;

  const pixels = imageData.data;

  for (let bitIndex = 0; bitIndex < totalBits; bitIndex++) {
    const pixelIndex =
      Math.floor(bitIndex / 3) * 4 +
      (bitIndex % 3);

    // Overwrite the embedded bit.
    pixels[pixelIndex] &= 0xfe;
  }

  return {
    imageData,
    clearedBytes: totalBytes,
  };
}


export function clearPayloadIfPresent(imageData) {
  const capacity = getCapacity(imageData);

  if (capacity < HEADER_SIZE) {
    return {
      imageData,
      found: false,
      clearedBytes: 0,
    };
  }

  const header = readBytes(imageData, 4);

  const matches = MAGIC.every(
    (value, index) => header[index] === value
  );

  if (!matches) {
    return {
      imageData,
      found: false,
      clearedBytes: 0,
    };
  }

  const result = clearPayload(imageData);

  return {
    ...result,
    found: true,
  };
}


