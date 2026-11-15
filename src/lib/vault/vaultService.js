
import {
  vaultGet,
  vaultGetAll,
  vaultPut,
  vaultDelete,
} from "./database";

import {
  createVaultVerifier,
  verifyVaultPassword,
  encryptVaultData,
  decryptVaultData,
} from "./vaultCrypto";

const VERIFIER_KEY = "master-verifier";
const EXPIRY_DURATION = 48 * 60 * 60 * 1000;

function getCrypto() {
  return globalThis.crypto;
}

export async function getVaultStatus() {
  return Boolean(await vaultGet("settings", VERIFIER_KEY));
}

export async function initializeVault(password) {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error(
      "Your master password must contain at least 12 characters."
    );
  }

  if (await getVaultStatus()) {
    throw new Error("The Vault has already been initialized.");
  }

  const verifier = await createVaultVerifier(password);

  await vaultPut("settings", {
    key: VERIFIER_KEY,
    ...verifier,
  });

  return true;
}

export async function unlockVault(password) {
  const verifier = await vaultGet("settings", VERIFIER_KEY);

  if (!verifier) {
    throw new Error("Create your Vault first.");
  }

  await verifyVaultPassword(password, verifier);

  return true;
}

async function createThumbnail(file) {
  const bitmap = await createImageBitmap(file);

  try {
    const maxSize = 180;

    const scale = Math.min(
      maxSize / bitmap.width,
      maxSize / bitmap.height,
      1
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Thumbnail creation failed.");
    }

    context.drawImage(
      bitmap,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Thumbnail export failed."));
        },
        "image/webp",
        0.75
      );
    });

    const buffer = await blob.arrayBuffer();

    let binary = "";

    for (const byte of new Uint8Array(buffer)) {
      binary += String.fromCharCode(byte);
    }

    return {
      data: btoa(binary),
      type: blob.type,
    };
  } finally {
    bitmap.close();
  }
}

export async function saveVaultRecord(password, file, secretKey) {
  if (!file || !secretKey) {
    throw new Error("Image and secret key are required.");
  }

  await unlockVault(password);

  const verifier = await vaultGet("settings", VERIFIER_KEY);

  const now = Date.now();

  const id = getCrypto().randomUUID();

  const thumbnail = await createThumbnail(file);

  const privateData = {
    imageName: file.name,
    imageSize: file.size,
    secretKey,
    thumbnail,
  };

  const encrypted = await encryptVaultData(
    password,
    verifier,
    privateData
  );

  await vaultPut("records", {
    id,
    createdAt: now,
    expiresAt: now + EXPIRY_DURATION,
    iv: encrypted.iv,
    ciphertext: encrypted.ciphertext,
  });

  return id;
}

export async function getVaultRecords(password) {
  await unlockVault(password);

  const verifier = await vaultGet("settings", VERIFIER_KEY);
  const records = await vaultGetAll("records");

  const now = Date.now();
  const activeRecords = [];

  for (const record of records) {
    if (record.expiresAt <= now) {
      await vaultDelete("records", record.id);
      continue;
    }

    try {
      const privateData = await decryptVaultData(
        password,
        verifier,
        record
      );

      activeRecords.push({
        ...record,
        ...privateData,
      });
    } catch {
      throw new Error(
        "A Vault record could not be verified. It may be corrupted."
      );
    }
  }

  return activeRecords.sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function deleteVaultRecord(id) {
  await vaultDelete("records", id);
}

export async function clearExpiredVaultRecords() {
  const records = await vaultGetAll("records");
  const now = Date.now();

  for (const record of records) {
    if (record.expiresAt <= now) {
      await vaultDelete("records", record.id);
    }
  }
}
