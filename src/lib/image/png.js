
const PNG_SIGNATURE = [
  137, 80, 78, 71, 13, 10, 26, 10,
];

export async function validatePNG(file) {
  if (!file) {
    throw new Error("Select an image first.");
  }

  if (file.type !== "image/png") {
    throw new Error(
      "This operation currently uses PNG pixel-LSB steganography. This image format needs its own carrier algorithm, so CIPHER will not convert it to PNG or alter the original file."
    );
  }

  const signature = new Uint8Array(
    await file.slice(0, 8).arrayBuffer()
  );

  const valid = PNG_SIGNATURE.every(
    (value, index) => signature[index] === value
  );

  if (!valid) {
    throw new Error("Invalid PNG file.");
  }

  return true;
}

export async function loadPNG(file) {
  await validatePNG(file);

  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    bitmap.close();
    throw new Error("Could not initialize image processing.");
  }

  context.drawImage(bitmap, 0, 0);

  bitmap.close();

  return {
    canvas,
    context,
    imageData: context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ),
  };
}

export function exportPNG(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG export failed."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
