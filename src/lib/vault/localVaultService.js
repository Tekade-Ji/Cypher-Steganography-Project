const DB_NAME = "cipher-local-vault";
const DB_VERSION = 1;
const STORE = "records";
const TTL_MS = 48 * 60 * 60 * 1000;

function openDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("This browser does not support local IndexedDB storage."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Unable to open browser storage."));
  });
}

async function transaction(mode, action) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    try {
      result = action(store);
    } catch (error) {
      reject(error);
      db.close();
      return;
    }
    tx.oncomplete = () => {
      db.close();
      resolve(result?.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error("Browser storage operation failed."));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error("Browser storage operation was aborted."));
    };
  });
}

async function makeThumbnail(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 240 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.78);
  } catch {
    return "";
  }
}

export async function getLocalVaultRecords() {
  const records = await transaction("readonly", (store) => store.getAll());
  const now = Date.now();
  const active = (records || []).filter((record) => record.expiresAt > now);

  const expired = (records || []).filter((record) => record.expiresAt <= now);
  for (const record of expired) {
    await deleteLocalVaultRecord(record.id);
  }

  return active.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveLocalVaultRecord(file, secretKey) {
  if (!file || !secretKey?.trim()) {
    throw new Error("An image and secret key are required.");
  }

  const now = Date.now();
  const record = {
    id: crypto.randomUUID(),
    imageName: file.name || "CIPHER image",
    imageSize: file.size || 0,
    imageType: file.type || "image/png",
    thumbnail: await makeThumbnail(file),
    secretKey,
    createdAt: now,
    expiresAt: now + TTL_MS,
  };

  await transaction("readwrite", (store) => store.put(record));
  return record;
}

export async function deleteLocalVaultRecord(id) {
  await transaction("readwrite", (store) => store.delete(id));
}
