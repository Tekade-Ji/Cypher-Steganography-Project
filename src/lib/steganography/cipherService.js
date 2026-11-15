import { encryptMessage, decryptMessage } from "../crypto/encryption";
import { embedPayload, extractPayload, clearPayload as clearLSBPayload } from "./lsb";
import { loadPNG, exportPNG } from "../image/png";
import { embedCipherKey } from "../image/cipherKeyMetadata";

export async function hideMessage(file, message, password, { embedKeyInMetadata = false } = {}) {
  const encrypted = await encryptMessage(message, password);
  const { canvas, context, imageData } = await loadPNG(file);
  const encodedImage = embedPayload(imageData, encrypted);
  context.putImageData(encodedImage, 0, 0);
  let blob = await exportPNG(canvas);
  if (embedKeyInMetadata) blob = await embedCipherKey(blob, password);
  return { blob, width: canvas.width, height: canvas.height, keyEmbeddedInMetadata: embedKeyInMetadata, outputFormat: "PNG" };
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
    outputFormat: "PNG",
  };
}
