
const PBKDF2_ITERATIONS = 310000;

function getCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Web Crypto is unavailable. Use localhost or HTTPS."
    );
  }

  return globalThis.crypto;
}

async function deriveKey(password, salt) {
  const crypto = getCrypto();

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(message, password) {
  if (!message.trim()) {
    throw new Error("Enter a message to encrypt.");
  }

  if (!password || password.length < 8) {
    throw new Error("Use a password with at least 8 characters.");
  }

  const crypto = getCrypto();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    new TextEncoder().encode(message)
  );

  return {
    salt,
    iv,
    ciphertext: new Uint8Array(encrypted),
  };
}

export async function decryptMessage(payload, password) {
  if (!password) {
    throw new Error("Enter the secret key.");
  }

  const key = await deriveKey(password, payload.salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: payload.iv,
        tagLength: 128,
      },
      key,
      payload.ciphertext
    );

    return new TextDecoder("utf-8", {
      fatal: true,
    }).decode(decrypted);
  } catch {
    throw new Error(
      "Decryption failed. The password may be incorrect, or the image may have been modified."
    );
  }
}

export function generateSecretKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
