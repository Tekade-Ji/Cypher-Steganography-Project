# CIPHER — Beyond Visible Information

CIPHER is a browser-based educational image steganography and metadata toolkit. It combines AES-256-GCM encryption with RGB least-significant-bit (LSB) steganography, and provides tools to inspect, edit and remove supported image metadata.

**CIPHER processes images in your browser. It does not require a CIPHER application server or user account.**

## Features

- Encrypt messages using AES-256-GCM through the Web Crypto API
- Derive 256-bit keys with PBKDF2-SHA-256 (310,000 iterations)
- Embed encrypted payloads in RGB least-significant bits
- Extract and decrypt CIPHER payloads
- Accept browser-decodable image inputs for steganography and export a lossless PNG carrier
- Optionally embed a key in the fixed `CIPHER_SECRET_KEY` PNG metadata field
- Automatically save generated carrier images and associated keys to the local browser Vault
- Store Vault records for 48 hours, with manual deletion and image download
- Inspect available image dimensions and EXIF metadata
- Remove selected PNG metadata chunks or all removable PNG ancillary metadata
- Edit common descriptive PNG metadata fields
- Clear a hidden CIPHER pixel payload separately from metadata cleaning
- Explore in-app lessons about AES-GCM, PBKDF2, LSB, PNG, Web Crypto and IndexedDB

## Documentation

The detailed project documentation is available in [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md). For step-by-step GitHub upload and Cloudflare Pages deployment, see [`docs/GITHUB_AND_DEPLOYMENT_GUIDE.md`](docs/GITHUB_AND_DEPLOYMENT_GUIDE.md). It covers the architecture, cryptographic design, steganography workflow, metadata tools, Vault, installation, deployment, privacy, limitations, testing and references.

## Run locally

### Requirements

- Node.js 22.23.4 (or a compatible newer release) is recommended for the current dependency set
- npm
- A modern browser

```bash
npm ci
npm run dev
```

Vite will print a local development URL, usually `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Deploy for free

CIPHER is a static Vite application. A straightforward option is **Cloudflare Pages**:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version environment variable | `NODE_VERSION=22.23.4` |

Connect the GitHub repository in Cloudflare Pages, configure these settings and deploy. Subsequent pushes to the production branch trigger new deployments.

See the [Cloudflare React deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/) and the detailed deployment instructions in the project documentation.

Free hosting plans have limits and terms that may change. No provider guarantees unlimited hosting forever.

## Image format behaviour

The browser decodes supported input images into pixels. CIPHER processes those pixels and exports the steganography carrier as PNG. PNG is lossless, which is important because pixel-level LSB data can be damaged by lossy compression.

JPEG, PNG, WebP, BMP and GIF are commonly supported by browsers, but exact support varies. HEIC/HEIF and camera RAW formats are not guaranteed. Animated formats are processed as a decoded frame rather than preserved as full animations.

Metadata support is separate from image decoding:
- PNG receives chunk-level inspection and supported chunk-level cleaning.
- EXIF inspection for other formats depends on parser support.
- Non-PNG metadata cleaning normalizes the decoded image to PNG and does not retain the original container metadata.
- The metadata editor writes common descriptive fields into PNG `iTXt` chunks; it does not edit every camera-specific EXIF, GPS or timestamp field.

## Important security notes

- AES-GCM provides confidentiality and authentication when used with a strong secret.
- Embedding the key in the image metadata is a convenience option, not secure key sharing. Anyone with the image can retrieve the key.
- The local Vault stores keys in IndexedDB without a master-password encryption layer. It is a temporary local convenience, not a secure password manager.
- LSB steganography is fragile. Resizing, recompression, filters, screenshots and lossy export can destroy hidden payload bits.
- Steganography does not guarantee undetectability. CIPHER is an educational project and has not undergone an independent security audit.

## Technology stack

React · Vite · JavaScript · Tailwind CSS · daisyUI · React Router · Motion · Web Crypto API · Canvas / ImageData · `exifr` · IndexedDB

## License

No open-source license is currently declared. Unless a license is added, normal copyright restrictions apply to reuse and redistribution.
