# CIPHER — Project Documentation

**Beyond Visible Information**

CIPHER is a client-side educational application that demonstrates how cryptography and image steganography can be combined. It encrypts a message, embeds the encrypted payload into image pixel data, and provides tools for inspecting, editing and removing supported image metadata.

> **Project status:** Educational demonstration. Not independently audited and not intended for high-assurance or production-sensitive communications.

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Objectives](#2-objectives)
3. [Features](#3-features)
4. [How the application works](#4-how-the-application-works)
5. [Cryptographic design](#5-cryptographic-design)
6. [Steganography design](#6-steganography-design)
7. [Image formats and normalization](#7-image-formats-and-normalization)
8. [Metadata tools](#8-metadata-tools)
9. [Local Vault](#9-local-vault)
10. [Technology stack](#10-technology-stack)
11. [Application architecture](#11-application-architecture)
12. [Project structure](#12-project-structure)
13. [Installation and local development](#13-installation-and-local-development)
14. [Build and deployment](#14-build-and-deployment)
15. [Privacy and security considerations](#15-privacy-and-security-considerations)
16. [Limitations](#16-limitations)
17. [Testing checklist](#17-testing-checklist)
18. [Troubleshooting](#18-troubleshooting)
19. [Further learning and references](#19-further-learning-and-references)

---

## 1. Project overview

Digital communication often focuses on protecting the contents of a message. Encryption addresses this by transforming readable information into ciphertext. However, encrypted data can still attract attention because its existence is visible.

Steganography addresses a different problem: concealing the existence of information by embedding it inside an ordinary-looking carrier, such as a digital image.

CIPHER combines both approaches:

- **Cryptography** protects the message contents.
- **Steganography** conceals the encrypted message inside image pixels.
- **Metadata tools** allow users to inspect, edit and remove supported information stored alongside image data.
- **Local Vault** keeps temporary references to generated images and their associated keys in the current browser profile.

CIPHER runs in the browser. It does not require a CIPHER application server or user account.

## 2. Objectives

The project has the following educational and practical objectives:

1. Demonstrate symmetric authenticated encryption using AES-256-GCM.
2. Demonstrate password-based key derivation using PBKDF2 and SHA-256.
3. Explain how least significant bit (LSB) steganography can encode data in image colour channels.
4. Show why lossless image storage is important for pixel-level steganography.
5. Demonstrate image metadata inspection, editing and removal.
6. Demonstrate browser-side file processing and local persistence with IndexedDB.
7. Provide an interface through which users can explore the concepts behind the implementation.

## 3. Features

### 3.1 Message encryption and hiding

- Enter a message and a secret key.
- Generate a secret key or provide one manually.
- Encrypt the message with AES-256-GCM.
- Derive the AES key using PBKDF2-SHA-256.
- Embed the encrypted payload in RGB least significant bits.
- Export a PNG carrier image.
- Download the resulting image.

### 3.2 Message extraction and decryption

- Upload a CIPHER carrier image.
- Extract the embedded payload.
- Validate the payload signature and version.
- Derive the key from the supplied secret.
- Authenticate and decrypt the ciphertext.
- Display the recovered message only if authentication succeeds.

### 3.3 Optional key metadata

CIPHER can place a secret key in a fixed PNG text metadata field named `CIPHER_SECRET_KEY`.

This is a convenience feature only. The key is not secret when it is embedded in the same image as the ciphertext. Anyone who can inspect the image can retrieve the key. Do not enable this option when the key must remain confidential.

### 3.4 Image metadata inspection

Depending on the input format and the browser/parser support, the application can inspect image dimensions and available metadata such as:

- Camera manufacturer and model
- Lens and software information
- Capture and modification dates
- GPS coordinates
- Descriptive text metadata
- PNG chunk information
- Physical pixel dimensions and colour-related information

The depth of inspection differs by image format. PNG files receive chunk-level inspection. EXIF inspection for other formats depends on the metadata parser's support for that file.

### 3.5 Metadata editing

The editor writes supported descriptive fields into PNG `iTXt` metadata:

- Title
- Author
- Description
- Copyright
- Software
- Comment

The editor does not claim to edit every camera-specific EXIF, GPS or timestamp field.

### 3.6 Metadata cleaning

The cleaner can remove selected supported PNG metadata chunks or all removable ancillary metadata while retaining required image data and selected rendering-related chunks.

Metadata cleaning is separate from hidden-payload removal. Cleaning metadata does not intentionally clear the LSB payload.

For non-PNG input, the image is normalized to PNG before the PNG metadata operation. The original non-PNG container metadata is not preserved by this conversion.

### 3.7 Hidden payload removal

The Payload Cleaner clears the CIPHER payload bits without needing the decryption key. This is destructive: the original least significant pixel values overwritten during embedding cannot be reconstructed from the carrier alone.

### 3.8 Local Vault

After successful encryption, CIPHER automatically saves the generated PNG, a thumbnail, the associated secret key and expiry information in IndexedDB.

- Storage is local to the current browser profile.
- Records expire after 48 hours.
- Users can download the saved image, copy its key or delete individual records.
- The Vault is not a cloud backup and does not synchronize between browsers or devices.
- The current Vault does not encrypt stored keys with a master password.

## 4. How the application works

### 4.1 Encryption and embedding flow

1. The user selects an image and enters a message.
2. The browser decodes the image into pixel data.
3. CIPHER generates a random salt and initialization vector (IV).
4. PBKDF2 derives a 256-bit AES key from the user's secret and salt.
5. AES-256-GCM encrypts the message.
6. CIPHER packages the versioned header and encrypted bytes.
7. The payload bits are embedded into RGB channel least significant bits.
8. The pixel buffer is exported as a PNG.
9. The PNG and key are saved automatically in the local Vault.
10. The user downloads the PNG carrier.

### 4.2 Extraction and decryption flow

1. The user uploads a PNG carrier.
2. CIPHER reads RGB least significant bits in the same deterministic order used during embedding.
3. It reconstructs the payload header and encrypted bytes.
4. It validates the magic signature, version and declared payload length.
5. PBKDF2 derives the AES key using the extracted salt and supplied secret.
6. AES-GCM verifies the authentication tag and decrypts the ciphertext.
7. If the key is incorrect or the payload was modified, authenticated decryption fails.

### 4.3 Why the carrier is PNG

Pixel-level LSB steganography depends on the exact pixel values remaining unchanged. PNG is lossless and preserves those values through encoding and decoding. JPEG is lossy and can change pixel values during compression. Resizing, filtering, screenshots and other transformations can also destroy a payload.

For this reason, CIPHER accepts browser-decodable image inputs for the steganography workflow but exports the carrier as PNG. The conversion is part of the processing pipeline; it is not a universal steganography algorithm for every image container.

## 5. Cryptographic design

### 5.1 AES-256-GCM

AES is a symmetric block cipher. CIPHER uses AES with a 256-bit key in Galois/Counter Mode (GCM).

GCM provides:

- Confidentiality: ciphertext does not reveal the original message without the key.
- Integrity/authentication: a tampered ciphertext or incorrect key causes authentication failure.

The implementation uses the browser's Web Crypto API.

### 5.2 PBKDF2-SHA-256

A user-provided secret is not used directly as an AES key. PBKDF2 derives key material from the secret and a random salt.

Current project parameters:

| Parameter | Value |
|---|---|
| Key derivation function | PBKDF2 |
| Hash | SHA-256 |
| Iterations | 310,000 |
| Derived key size | 256 bits |
| Salt size | 16 bytes |
| AES mode | AES-GCM |
| IV size | 12 bytes |

The salt and IV are not secret. They must be stored with the encrypted payload so that the key can be derived and the message decrypted later.

A strong, unique secret remains important. Key derivation increases the cost of guessing; it does not make a weak password strong.

### 5.3 Randomness

Salts, IVs and generated secret material must come from cryptographically secure randomness provided by the browser (`crypto.getRandomValues`). They must not be generated with `Math.random()`.

## 6. Steganography design

### 6.1 Least significant bit

A colour channel is represented by a number. In an 8-bit channel, the least significant bit is the rightmost binary digit.

For example:

```text
Decimal 200 = binary 11001000
Decimal 201 = binary 11001001
```

Changing the least significant bit changes the channel value by at most one. Small changes are generally difficult to notice visually, but they are not guaranteed to be statistically undetectable.

### 6.2 RGB channel embedding

CIPHER writes payload bits into the least significant bits of RGB colour channels. The alpha channel is not used for payload storage.

The extractor follows the same channel order and reconstructs the payload bytes.

### 6.3 Payload structure

The current payload includes:

- `CPHR` magic signature
- Payload version
- Random salt
- Initialization vector
- Ciphertext length
- Encrypted ciphertext (including the GCM authentication tag)

The magic signature helps distinguish CIPHER data from arbitrary pixel data. The version field allows the format to evolve.

### 6.4 Capacity

Each usable RGB channel contributes one bit. The theoretical raw capacity is therefore approximately three bits per pixel before accounting for the payload header and implementation constraints.

The actual maximum message size depends on image dimensions and the payload format. Large images can require substantial browser memory while decoding, processing and exporting.

### 6.5 Limitations of LSB

LSB is simple and useful for demonstrating the principle of spatial-domain steganography. It is also fragile.

Operations that can damage or remove the hidden data include:

- JPEG recompression
- Resizing or resampling
- Image filters and colour adjustments
- Screenshots
- Social media image processing
- Re-encoding through applications that change pixel values

LSB steganography should not be described as undetectable or tamper-proof.

## 7. Image formats and normalization

The browser's ability to decode an image depends on the browser, operating system and installed codecs.

Common browser-decodable inputs can include JPEG, PNG, WebP, BMP and GIF. HEIC/HEIF and camera RAW files are not guaranteed to work.

For the hide/extract workflow:

- Input images are decoded into pixel data.
- CIPHER embeds or extracts the payload from that pixel representation.
- The generated carrier is exported as PNG.
- Animated formats are treated as a decoded image frame, not as a complete animation.

PNG output is intentional. Saving a pixel-LSB carrier as a lossy format can destroy the embedded payload.

Metadata support is a separate concern. The fact that a browser can decode an image does not mean CIPHER can inspect or edit every metadata field in that image's original file container.

## 8. Metadata tools

### 8.1 Inspection

The metadata inspector combines browser image information, EXIF parsing and PNG-specific chunk parsing.

PNG chunk inspection can identify chunks such as:

| Chunk | Purpose |
|---|---|
| `IHDR` | Image dimensions, bit depth and colour type |
| `IDAT` | Compressed image data |
| `IEND` | End of PNG |
| `eXIf` | EXIF metadata |
| `tEXt` | Uncompressed text |
| `zTXt` | Compressed text |
| `iTXt` | International text |
| `tIME` | Modification timestamp |
| `pHYs` | Physical pixel dimensions |
| `iCCP` | Embedded ICC colour profile |

Some chunks are essential for rendering. Others are ancillary. A cleaner must not remove required image data or critical chunks.

### 8.2 Editing

The editor writes common descriptive metadata as UTF-8 text in PNG `iTXt` chunks. Existing entries for the same supported fields are replaced.

This is not a general-purpose EXIF editor. Camera-specific fields, GPS structures, timestamps and vendor-specific metadata are outside the editor's current guaranteed scope.

### 8.3 Cleaning

The cleaner removes selected supported ancillary chunks or all removable ancillary chunks according to its selected mode. Rendering-critical chunks are preserved.

For non-PNG files, the tool normalizes the decoded image to PNG before applying PNG metadata operations. Original non-PNG container metadata is therefore not retained.

### 8.4 Payload cleaning is separate

Metadata is stored in the image container; the CIPHER payload is embedded in pixel values. These are different layers of the file.

Removing metadata should not automatically modify pixel LSBs. The Payload Cleaner is a separate destructive operation.

## 9. Local Vault

The Vault uses IndexedDB, a database API built into modern browsers.

Each record contains:

- A unique record identifier
- Image filename and MIME type
- Image size
- Generated PNG image blob
- Thumbnail
- Associated secret key
- Creation timestamp
- Expiry timestamp

Records are set to expire after 48 hours. Expired records are removed when the Vault loads and checks stored records.

### Storage boundaries

IndexedDB is scoped to the browser's origin and profile. Records do not automatically move to another device or browser. Clearing site data can remove them.

The current implementation stores the secret key locally without a master-password encryption layer. Treat the Vault as a temporary convenience feature, not a secure password manager. Avoid using it on a shared or untrusted browser profile.

## 10. Technology stack

| Technology | Responsibility |
|---|---|
| React | Component-based user interface |
| Vite | Development server and production bundler |
| JavaScript | Application logic |
| Tailwind CSS | Utility-first styling |
| daisyUI | Theme and UI utilities |
| React Router | Client-side navigation |
| Motion | Interface animations |
| Lucide React | Interface icons |
| Web Crypto API | AES-GCM, PBKDF2 and secure randomness |
| Canvas / ImageData | Browser image decoding and pixel manipulation |
| `exifr` | EXIF metadata parsing |
| IndexedDB | Local Vault persistence |
| Lenis | Smooth scrolling |

No application backend is required for the core image, encryption, steganography, metadata or Vault workflows.

## 11. Application architecture

CIPHER is organized into presentation pages, reusable interface components and browser-side service modules.

### Main routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/technology` | Technology overview |
| `/learn/:topic` | In-app technical lessons |
| `/studio` | Encryption, hiding, extraction and decryption |
| `/studio/vault` | Local Vault |
| `/studio/metadata` | Metadata inspection |
| `/studio/metadata-editor` | Descriptive PNG metadata editor |
| `/studio/cleaner` | Metadata cleaning |
| `/studio/clear-payload` | Hidden pixel payload removal |

### Processing boundaries

- `src/lib/crypto/` contains cryptographic operations.
- `src/lib/steganography/` contains payload embedding and extraction.
- `src/lib/image/` contains PNG handling and metadata operations.
- `src/lib/vault/` contains IndexedDB persistence.
- `src/pages/` contains route-level screens.
- `src/components/` contains reusable interface components.
- `src/sections/` contains landing-page sections.

## 12. Project structure

```text
CIPHER/
├── docs/
│   └── PROJECT_DOCUMENTATION.md
├── public/
├── src/
│   ├── components/
│   │   ├── brand/
│   │   ├── effects/
│   │   ├── navigation/
│   │   ├── studio/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── crypto/
│   │   ├── image/
│   │   ├── steganography/
│   │   └── vault/
│   ├── pages/
│   │   └── studio/
│   ├── sections/
│   └── styles/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## 13. Installation and local development

### Prerequisites

- Git
- Node.js 22.23.4 (or a compatible newer release) is recommended for the current dependency set.
- npm (included with Node.js)
- A modern browser with Web Crypto, Canvas and IndexedDB support

Check versions:

```bash
node --version
npm --version
git --version
```

### Clone the repository

Replace the URL with the actual repository URL:

```bash
git clone https://github.com/YOUR_USERNAME/CIPHER.git
cd CIPHER
```

### Install dependencies

```bash
npm ci
```

If `npm ci` fails because the lockfile is out of sync with `package.json`, inspect the error before using `npm install`. Do not delete the lockfile as a first troubleshooting step.

### Start the development server

```bash
npm run dev
```

Vite prints a local URL, usually:

```text
http://localhost:5173
```

### Create a production build

```bash
npm run build
```

Vite writes the static production files to `dist/`.

### Preview the production build locally

```bash
npm run preview
```

## 14. Build and deployment

CIPHER is a static Vite application. It can be deployed to a static hosting provider without a backend.

### Recommended host: Cloudflare Pages

Cloudflare Pages supports Git integration and can automatically build and deploy the site whenever the production branch is updated.

Build configuration:

| Setting | Value |
|---|---|
| Framework preset | Vite (or None) |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version environment variable | `NODE_VERSION` = `22.23.4` |

Deployment outline:

1. Push the project to GitHub.
2. Sign in to Cloudflare.
3. Open **Workers & Pages**.
4. Create an application and choose **Pages**.
5. Import the GitHub repository.
6. Enter the build settings above.
7. Deploy.
8. Open the generated `*.pages.dev` address and test the application.

Cloudflare Pages supports single-page application routing by default when the deployment does not include a top-level `404.html`. Confirm direct navigation to routes such as `/studio`, `/studio/vault` and `/learn/lsb` after deployment.

The free plan has usage limits and provider terms can change. “Free” should not be interpreted as a contractual guarantee of unlimited service forever.

### HTTPS requirement

Web Crypto features require a secure context. Production deployment should use HTTPS. Cloudflare Pages provides HTTPS for its Pages subdomain.

### Automatic deployment

After Git integration is enabled, pushing a commit to the configured production branch triggers a new build and deployment. Preview deployments can be used to review changes before merging them into the production branch.

## 15. Privacy and security considerations

### Local processing

The core image processing, encryption, decryption, metadata operations and Vault storage are performed in the browser. The project does not require a CIPHER backend to process images.

If an optional reverse-geocoding feature is used, GPS coordinates may be sent to the external geocoding provider to resolve a human-readable location. Do not describe that optional request as fully local.

### Key handling

- The secret key is required to decrypt the message.
- A key embedded in `CIPHER_SECRET_KEY` metadata is readable by anyone who can inspect the image.
- The local Vault stores keys without a master-password encryption layer.
- Do not use the Vault as a secure password manager.

### Steganography is not invisibility

LSB changes may be visually subtle, but statistical steganalysis can detect patterns. CIPHER does not provide a guarantee of undetectability.

### No security audit

The application is an educational project. Its cryptographic choices use established browser APIs, but the complete application has not undergone an independent security audit. Do not use it as the sole protection for highly sensitive information.

## 16. Limitations

1. Steganography carrier output is PNG.
2. Input decoding depends on browser and operating-system support.
3. HEIC/HEIF and RAW formats are not guaranteed.
4. Animated image formats are not preserved as complete animations by the pixel workflow.
5. PNG receives the most complete container-level metadata support.
6. Non-PNG metadata cleaning normalizes pixels to PNG and does not preserve the original container metadata.
7. Metadata editing is limited to common descriptive PNG text fields.
8. The Vault is browser-local, temporary and not master-password encrypted.
9. LSB payloads can be destroyed by image transformations.
10. The application has not been independently security-audited.

## 17. Testing checklist

Before publishing a release, test the following in the deployed HTTPS site:

### Encryption and steganography

- [ ] Generate a secret key.
- [ ] Encrypt a short message in a PNG.
- [ ] Download the generated carrier.
- [ ] Upload the downloaded carrier and decrypt it with the correct key.
- [ ] Confirm that a wrong key fails.
- [ ] Confirm that a modified/corrupted payload fails authentication.
- [ ] Test a JPEG input and verify that the output is PNG.
- [ ] Test a browser-supported WebP input.
- [ ] Test a large image and confirm that capacity or memory errors are handled clearly.
- [ ] Test a file that the browser cannot decode and confirm a useful error.

### Key metadata and Vault

- [ ] Enable key metadata and confirm the `CIPHER_SECRET_KEY` field is written.
- [ ] Confirm the key can be retrieved from metadata.
- [ ] Confirm the UI explains that an embedded key is not confidential.
- [ ] Confirm successful encryption automatically creates a Vault record.
- [ ] Download an image from the Vault.
- [ ] Copy its key.
- [ ] Delete one record.
- [ ] Confirm expired records are removed.
- [ ] Confirm records are not expected to synchronize across browsers.

### Metadata

- [ ] Inspect a PNG with EXIF/text metadata.
- [ ] Inspect a JPEG with EXIF metadata.
- [ ] Edit each supported descriptive field.
- [ ] Reinspect the edited PNG.
- [ ] Remove one selected metadata chunk.
- [ ] Remove all removable metadata.
- [ ] Confirm image rendering data remains intact.
- [ ] Confirm metadata cleaning does not clear the LSB payload.
- [ ] Test payload removal separately.

### Deployment and navigation

- [ ] Open the home page.
- [ ] Open `/technology`.
- [ ] Open every in-app `/learn/:topic` route directly.
- [ ] Open `/studio` and every Studio tool route directly.
- [ ] Refresh nested routes and confirm there is no 404.
- [ ] Test mobile layout.
- [ ] Test browser back/forward navigation.
- [ ] Confirm the site is served over HTTPS.

## 18. Troubleshooting

### `npm ci` fails

Check the Node.js version and the complete npm error. Use the Node version supported by the current Vite and React Router dependency versions. Keep `package-lock.json` committed so local and hosted builds use a reproducible dependency tree.

### Build fails on the hosting provider

Check:

- The repository root is configured correctly.
- The build command is `npm run build`.
- The output directory is `dist`.
- The selected Node.js version is compatible.
- The build log identifies the first actual error.

### Browser refresh returns a 404

The host must support SPA fallback routing. Cloudflare Pages treats projects without a top-level `404.html` as single-page applications by default. Check that no custom 404 file or routing rule is overriding that behaviour.

### Web Crypto is unavailable

Use `localhost` for local development or HTTPS in production. Browsers restrict powerful cryptographic APIs to secure contexts.

### Image cannot be processed

The browser may not support decoding the image format or the file may be damaged. Try exporting a standard PNG or JPEG from an image editor. Do not rename the file extension as a substitute for converting the file.

### Decryption fails

Verify that:

- The carrier is the original downloaded PNG.
- The correct secret key is being used.
- The image was not resized, recompressed or edited.
- The payload has not been cleared or corrupted.

## 19. Further learning and references

These are primary references for the technologies used in CIPHER:

- [NIST SP 800-38D — Galois/Counter Mode (GCM)](https://csrc.nist.gov/pubs/sp/800/38/d/final)
- [RFC 8018 — PKCS #5 / PBKDF2](https://www.rfc-editor.org/rfc/rfc8018)
- [MDN — Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [MDN — SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
- [W3C — PNG Specification](https://www.w3.org/TR/png-3/)
- [MDN — ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
- [MDN — createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap)
- [MDN — IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Cloudflare Pages — React deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Cloudflare Pages — Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Vite — Static deployment](https://vite.dev/guide/static-deploy)

---

## Project note

CIPHER is intended to make the relationship between cryptography, steganography and image metadata understandable through a working browser application. Its value is both practical and educational: users can experiment with the complete process and explore the technical concepts behind each stage.
