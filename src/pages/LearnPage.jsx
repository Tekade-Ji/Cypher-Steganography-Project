import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowUpRight, BookOpen, LockKeyhole, Binary, Image as ImageIcon, Database, Cpu, Fingerprint } from "lucide-react";
import Navbar from "../components/navigation/Navbar";
import Footer from "../sections/footer/Footer";

const topics = {
  steganography: {
    title: "Steganography", eyebrow: "THE CENTRAL IDEA", icon: Binary,
    intro: "Steganography is the practice of concealing the existence of a message. CIPHER first encrypts the message, then hides the encrypted bytes inside the pixel data of a PNG image.",
    sections: [
      ["Encryption versus concealment", "Encryption transforms readable text into ciphertext. Anyone who sees the ciphertext knows that protected information exists. Steganography hides the ciphertext inside an ordinary-looking carrier image. The two techniques complement one another but are not interchangeable."],
      ["CIPHER's workflow", "The browser reads the image pixels, encrypts the message with AES-256-GCM, packages the salt, IV and ciphertext in a versioned payload, then writes payload bits into the least significant bits of RGB colour channels. The result is exported as a lossless PNG."],
      ["Why use an image?", "Digital images contain many pixel values. Changing the least significant bit of a colour channel changes its numeric value by at most one. Small changes are usually difficult to notice visually, although statistical analysis can still detect some LSB steganography."],
      ["Limitations", "Resizing, recompression, filters, screenshots and lossy formats can destroy hidden pixel bits. CIPHER's LSB method is educational and should not be treated as a substitute for secure communication or professional steganographic systems."]
    ],
    resources: [["NIST: Steganography overview (NIST publications search)", "https://csrc.nist.gov/search?query=steganography"], ["PNG specification", "https://www.w3.org/TR/png-3/"]]
  },
  aes: {
    title: "AES-256-GCM", eyebrow: "AUTHENTICATED ENCRYPTION", icon: LockKeyhole,
    intro: "AES is a symmetric block cipher. CIPHER uses AES with a 256-bit key in Galois/Counter Mode (GCM), which provides confidentiality and an authentication tag that detects tampering.",
    sections: [
      ["Symmetric encryption", "The same cryptographic key is used to encrypt and decrypt the message. The key must remain secret. A wrong key or modified ciphertext causes authenticated decryption to fail."],
      ["What GCM adds", "GCM combines counter-mode encryption with authentication. CIPHER uses a 128-bit authentication tag. This means a recipient does not merely get scrambled bytes: the browser also verifies that the ciphertext has not been altered."],
      ["Random IV and salt", "CIPHER generates a fresh 12-byte IV for each encryption operation. The salt is 16 bytes and is used by PBKDF2 to derive the AES key. The IV and salt are stored with the encrypted payload because they are not secret."],
      ["In this project", "The encryption implementation is in src/lib/crypto/encryption.js. It uses the browser Web Crypto API and UTF-8 encoding for the message."]
    ],
    resources: [["NIST SP 800-38D: GCM", "https://csrc.nist.gov/pubs/sp/800/38/d/final"], ["MDN: SubtleCrypto.encrypt", "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt"]]
  },
  pbkdf2: {
    title: "PBKDF2", eyebrow: "PASSWORD-BASED KEY DERIVATION", icon: Fingerprint,
    intro: "PBKDF2 converts a human-provided password and a random salt into key material suitable for cryptographic use. It deliberately performs many iterations to make password guessing more expensive.",
    sections: [
      ["Why not use a password directly?", "Human passwords are variable in length and often have limited entropy. AES-256 expects a fixed-size key. A key derivation function transforms the password into a key of the required size."],
      ["Salt", "A salt is a random value stored beside the encrypted data. It ensures that the same password does not produce the same derived key every time and prevents precomputed lookup tables from being reused across records."],
      ["CIPHER parameters", "The project uses PBKDF2 with SHA-256 and 310,000 iterations to derive a 256-bit AES-GCM key. The implementation uses a fresh 16-byte salt for each message."],
      ["Practical advice", "A strong, unique secret is still important. PBKDF2 slows guessing but cannot turn a very weak password into a strong one."]
    ],
    resources: [["RFC 8018: PKCS #5", "https://www.rfc-editor.org/rfc/rfc8018"], ["MDN: SubtleCrypto.deriveKey", "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey"]]
  },
  lsb: {
    title: "RGB Least Significant Bit", eyebrow: "PIXEL-LEVEL STEGANOGRAPHY", icon: Binary,
    intro: "The least significant bit is the rightmost bit in a binary number. Changing it changes the channel value by one. CIPHER uses this small numerical change to encode payload bits in RGB image channels.",
    sections: [
      ["A simple example", "The decimal value 200 is binary 11001000. Changing its least significant bit produces 11001001, which is 201. The numerical difference is only one."],
      ["Embedding", "CIPHER serializes a payload header and encrypted message into bytes. It then writes the bits into RGB channel values in a deterministic sequence. The alpha channel is not used for payload storage."],
      ["Extraction", "The extractor reads the same channel positions, reconstructs the payload header, checks the CPHR signature and version, reads the declared ciphertext length, then passes the salt, IV and ciphertext to AES-GCM decryption."],
      ["Why PNG matters", "PNG uses lossless compression. It preserves pixel values exactly. JPEG compression changes pixel values, so a pixel-LSB payload can be damaged or destroyed by saving as JPEG."]
    ],
    resources: [["PNG specification", "https://www.w3.org/TR/png-3/"], ["MDN: ImageData", "https://developer.mozilla.org/en-US/docs/Web/API/ImageData"]]
  },
  png: {
    title: "PNG image format", eyebrow: "LOSSLESS IMAGE STORAGE", icon: ImageIcon,
    intro: "PNG is a lossless raster image format. CIPHER uses PNG as the output carrier because exact pixel values must survive export and later extraction.",
    sections: [
      ["Lossless compression", "PNG compression reduces file size without changing the underlying pixel values. This is essential for the project's LSB technique."],
      ["Chunks", "A PNG file is organized into chunks. Critical chunks describe and contain image data. Ancillary chunks can store metadata such as text, EXIF information, timestamps and colour profiles."],
      ["Normalization in CIPHER", "For steganography, browser-decodable input images are drawn into an internal pixel buffer and exported as PNG. The user stays in the CIPHER workflow, but the downloaded steganography carrier is PNG."],
      ["Format trade-offs", "Converting a JPEG, WebP or other source into PNG does not restore information lost by the source's original compression. Some formats such as HEIC and camera RAW may not be supported by the current browser."]
    ],
    resources: [["W3C PNG specification", "https://www.w3.org/TR/png-3/"], ["MDN: createImageBitmap", "https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap"]]
  },
  webcrypto: {
    title: "Web Crypto API", eyebrow: "BROWSER CRYPTOGRAPHY", icon: Cpu,
    intro: "The Web Crypto API gives web applications access to cryptographic primitives implemented by the browser. CIPHER uses it so encryption can happen on the user's device.",
    sections: [
      ["SubtleCrypto", "The crypto.subtle interface exposes operations such as importKey, deriveKey, encrypt and decrypt. These methods return promises and work with ArrayBuffer-compatible data."],
      ["Secure randomness", "CIPHER uses crypto.getRandomValues to generate salts, IVs and secret-key material. Security-sensitive random values should not be generated with Math.random."],
      ["Secure context", "Web Crypto is available in secure contexts such as HTTPS and localhost. A deployed CIPHER site must use HTTPS."],
      ["Local processing", "The image and message are processed in the browser. This project does not require a CIPHER application server to encrypt or embed the data."]
    ],
    resources: [["MDN: Web Crypto API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API"], ["W3C Web Cryptography API", "https://www.w3.org/TR/WebCryptoAPI/"]]
  },
  indexeddb: {
    title: "IndexedDB", eyebrow: "LOCAL BROWSER STORAGE", icon: Database,
    intro: "IndexedDB is a browser database for structured data. CIPHER uses it to keep temporary encrypted-image records, thumbnails and associated keys on the device.",
    sections: [
      ["Why IndexedDB?", "Unlike localStorage, IndexedDB can store structured records and Blob objects. This makes it suitable for saving image files and related data."],
      ["Automatic expiry", "CIPHER records include creation and expiry timestamps. The Vault removes expired records when it loads. The current retention period is 48 hours."],
      ["Device-local storage", "Records belong to the browser profile and device. Clearing browser site data or using another browser profile can make them unavailable. They are not synchronized to a CIPHER server."],
      ["Important distinction", "The current local Vault stores the key in browser storage without a master password. It is a convenience feature for a local educational project, not a secure password manager."]
    ],
    resources: [["MDN: IndexedDB API", "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"], ["MDN: IDBObjectStore", "https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore"]]
  }
};

function LearnPage() {
  const { topic } = useParams();
  const data = topics[topic] || topics.steganography;
  const Icon = data.icon;
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-200 py-14 md:py-20">
        <div className="cipher-container max-w-4xl">
          <Link to="/technology" className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-primary"><ArrowLeft size={16} />Back to Technology</Link>
          <div className="rounded-[28px] border border-base-300 bg-base-100 p-7 md:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={28} /></div>
            <p className="mt-8 font-pixel text-[9px] tracking-widest text-primary">{data.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.07em] md:text-7xl">{data.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-base-content/65">{data.intro}</p>
            <div className="mt-12 space-y-9">
              {data.sections.map(([heading, body], index) => <section key={heading} className="border-t border-base-300 pt-7">
                <p className="font-pixel text-[8px] text-primary">CONCEPT / 0{index + 1}</p>
                <h2 className="mt-3 font-display text-2xl font-bold">{heading}</h2>
                <p className="mt-3 text-sm leading-8 text-base-content/65">{body}</p>
              </section>)}
            </div>
            <div className="mt-12 border-t border-base-300 pt-8">
              <h2 className="font-display text-2xl font-bold">Explore connected concepts</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["Encryption", "aes"],
                  ["Key derivation", "pbkdf2"],
                  ["LSB technique", "lsb"],
                  ["PNG format", "png"],
                  ["Browser cryptography", "webcrypto"],
                  ["Local storage", "indexeddb"],
                ].filter(([, id]) => id !== topic).map(([label, id]) => (
                  <Link key={id} to={`/learn/${id}`} className="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-xs font-bold transition-colors hover:border-primary hover:text-primary">{label} ↗</Link>
                ))}
              </div>
            </div>
            <div className="mt-12 rounded-2xl bg-base-200 p-6">
              <div className="flex items-center gap-2 font-bold"><BookOpen size={18} className="text-primary" />Official learning resources</div>
              <div className="mt-4 space-y-3">
                {data.resources.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 text-sm font-semibold text-primary hover:underline">{label}<ArrowUpRight size={16} /></a>)}
              </div>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/studio" className="cipher-button cipher-button-primary">Try CIPHER Studio</Link>
            <Link to="/technology" className="inline-flex items-center rounded-xl border border-base-300 px-5 py-3 text-sm font-bold hover:bg-base-100">Explore other technologies</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
export default LearnPage;
