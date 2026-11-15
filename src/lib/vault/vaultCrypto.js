
const ITERATIONS = 310000;

function cryptoAPI() {
  if (!crypto?.subtle) {
    throw new Error("Secure browser cryptography is unavailable.");
  }

  return crypto;
}

async function deriveVaultKey(password, salt) {
  const api = cryptoAPI();

  const material = await api.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return api.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    material,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function createVaultVerifier(password) {
  const api = cryptoAPI();

  const salt = api.getRandomValues(new Uint8Array(16));
  const iv = api.getRandomValues(new Uint8Array(12));

  const key = await deriveVaultKey(password, salt);

  const encrypted = await api.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    new TextEncoder().encode("CIPHER-VAULT-VERIFIED-V1")
  );

  return {
    salt,
    iv,
    ciphertext: new Uint8Array(encrypted),
  };
}

export async function verifyVaultPassword(password, verifier) {
  const key = await deriveVaultKey(password, verifier.salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: verifier.iv,
      },
      key,
      verifier.ciphertext
    );

    const value = new TextDecoder().decode(decrypted);

    if (value !== "CIPHER-VAULT-VERIFIED-V1") {
      throw new Error("Invalid master password.");
    }

    return true;
  } catch {
    throw new Error("Incorrect master password.");
  }
}

export async function encryptVaultData(password, verifier, data) {
  const api = cryptoAPI();

  const key = await deriveVaultKey(password, verifier.salt);

  const iv = api.getRandomValues(new Uint8Array(12));

  const encrypted = await api.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );

  return {
    iv,
    ciphertext: new Uint8Array(encrypted),
  };
}

export async function decryptVaultData(password, verifier, record) {
  const key = await deriveVaultKey(password, verifier.salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: record.iv,
    },
    key,
    record.ciphertext
  );

  return JSON.parse(
    new TextDecoder().decode(decrypted)
  );
}
