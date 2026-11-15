import {
  encryptMessage,
  decryptMessage,
} from "../crypto/encryption";

import {
  embedPayload,
  extractPayload,
} from "./lsb";

import {
  loadPNG,
  exportPNG,
} from "../image/png";

import { clearPayload as clearLSBPayload } from "./lsb";
import { embedCipherKey } from "../image/cipherKeyMetadata";

/**
 * Encrypts a message and hides it in PNG pixel data.
 * Set embedKeyInMetadata=true only after the user explicitly opts in.
 */
export async function hideMessage(
  file,
  message,
  password,
  { embedKeyInMetadata = false } = {}
) {
  const encrypted = await encryptMessage(message, password);
  const { canvas, context, imageData } = await loadPNG(file);

  const encodedImage = embedPayload(imageData, encrypted);
  context.putImageData(encodedImage, 0, 0);

  let blob = await exportPNG(canvas);

  if (embedKeyInMetadata) {
    blob = await embedCipherKey(blob, password);
  }

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    keyEmbeddedInMetadata: embedKeyInMetadata,
  };
}

export async function revealMessage(file, password) {
  const { imageData } = await loadPNG(file);
  const encrypted = extractPayload(imageData);
  return decryptMessage(encrypted, password);
}

export async function removeHiddenPayload(file) {
  const { canvas, context, imageData } = await loadPNG(file);
  const result = clearLSBPayload(imageData);
  context.putImageData(result.imageData, 0, 0);

  return {
    blob: await exportPNG(canvas),
    clearedBytes: result.clearedBytes,
    width: canvas.width,
    height: canvas.height,
  };
}
