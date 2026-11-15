const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

export function isPNG(file) {
  return Boolean(file && file.type === "image/png");
}

export async function validateImage(file) {
  if (!file) throw new Error("Select an image first.");
  if (file.size > 40 * 1024 * 1024) {
    throw new Error("Images larger than 40 MB are not supported in this browser workspace.");
  }
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isPng = PNG_SIGNATURE.every((value, index) => signature[index] === value);
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8;
  const isGif = signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46;
  const isWebp = signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[8] === 0x57;
  const isBmp = signature[0] === 0x42 && signature[1] === 0x4d;
  const isTiff = (signature[0] === 0x49 && signature[1] === 0x49 && signature[2] === 0x2a && signature[3] === 0) ||
    (signature[0] === 0x4d && signature[1] === 0x4d && signature[2] === 0 && signature[3] === 0x2a);
  const extensionSupported = /\.(png|jpe?g|gif|webp|bmp|tiff?|heic|heif|dng|cr2|cr3|nef|arw|rw2|orf|raf)$/i.test(file.name || "");
  if (!(isPng || isJpeg || isGif || isWebp || isBmp || isTiff || file.type.startsWith("image/") || extensionSupported)) {
    throw new Error("This file does not appear to be a supported image.");
  }
  return { isPng, format: isPng ? "PNG" : isJpeg ? "JPEG" : isWebp ? "WebP" : isGif ? "GIF" : isBmp ? "BMP" : isTiff ? "TIFF" : (file.type || "image").toUpperCase() };
}

export async function loadPNG(file) {
  await validateImage(file);
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error("This image format is not supported by your browser. Try a PNG, JPEG or WebP image. HEIC and camera RAW support depends on the browser.");
    }
  }

  const maxDimension = 12000;
  if (bitmap.width > maxDimension || bitmap.height > maxDimension ||
      bitmap.width * bitmap.height > 30_000_000) {
    bitmap.close?.();
    throw new Error("This image is too large to process safely. Use an image below 30 megapixels.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close?.();
    throw new Error("Could not initialize image processing.");
  }
  context.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return {
    canvas,
    context,
    imageData: context.getImageData(0, 0, canvas.width, canvas.height),
    sourceFormat: (file.type || "unknown").toLowerCase(),
    sourceName: file.name || "image",
  };
}

export function exportPNG(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("PNG export failed."));
      else resolve(blob);
    }, "image/png");
  });
}

export async function normalizeToPNG(file) {
  const { canvas, sourceFormat } = await loadPNG(file);
  const blob = await exportPNG(canvas);
  return { blob, width: canvas.width, height: canvas.height, sourceFormat };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
