
import { useState } from "react";
import { Link } from "react-router";

import {
  ArrowLeft,
  ArrowDownToLine,
  LockKeyhole,
  UnlockKeyhole,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Vault,
  FileSearch,
  Eraser,
} from "lucide-react";

import Navbar from "../components/navigation/Navbar";
import Footer from "../sections/footer/Footer";
import ImageUploader from "../components/studio/ImageUploader";

import { generateSecretKey } from "../lib/crypto/encryption";
import {
  hideMessage,
  revealMessage,
} from "../lib/steganography/cipherService";

import { downloadBlob } from "../lib/image/png";
import { extractCipherKey } from "../lib/image/cipherKeyMetadata";

function StudioPage() {
  const [mode, setMode] = useState("encrypt");
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [embedKeyInMetadata, setEmbedKeyInMetadata] = useState(false);
  const [needsManualKey, setNeedsManualKey] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetResults() {
    setResult(null);
    setError("");
    setSuccess("");
    setNeedsManualKey(false);
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setFile(null);
    setMessage("");
    setPassword("");
    setShowPassword(false);
    setEmbedKeyInMetadata(false);
    resetResults();
  }

  function createPassword() {
    setPassword(generateSecretKey());
    setShowPassword(true);
    setSuccess("A secure secret key has been generated.");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    resetResults();

    if (!file) {
      setError("Select an image first.");
      return;
    }

    if (mode === "encrypt" && !password.trim()) {
      setError("Enter or generate your secret key.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "encrypt") {
        if (!message.trim()) {
          throw new Error("Enter your secret message.");
        }

        const output = await hideMessage(file, message, password, {
          embedKeyInMetadata,
        });

        setResult({
          type: "image",
          blob: output.blob,
          width: output.width,
          height: output.height,
        });

        setSuccess(
          embedKeyInMetadata
            ? "Message hidden. The secret key was also added to the PNG metadata."
            : "Your message has been encrypted and hidden."
        );
      } else {
        // Always try the fixed CIPHER metadata field first.
        const metadataKey = await extractCipherKey(file).catch(() => null);

        if (metadataKey) {
          try {
            const extracted = await revealMessage(file, metadataKey);
            setResult({ type: "message", message: extracted });
            setSuccess("Message recovered automatically using the key in PNG metadata.");
            setNeedsManualKey(false);
            return;
          } catch {
            // Metadata may contain an outdated or incorrect key. Fall back.
          }
        }

        if (!password.trim()) {
          setNeedsManualKey(true);
          setError(
            metadataKey
              ? "The key stored in metadata did not work. Enter the correct secret key."
              : "No CIPHER key was found in metadata. Enter your secret key."
          );
          return;
        }

        const extracted = await revealMessage(file, password);
        setResult({ type: "message", message: extracted });
        setSuccess("Your secret message was successfully recovered using your entered key.");
        setNeedsManualKey(false);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyMessage() {
    if (!result?.message) return;

    try {
      await navigator.clipboard.writeText(result.message);
      setSuccess("Message copied to clipboard.");
      setError("");
    } catch {
      setError("Clipboard access is unavailable.");
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-200 py-12 md:py-20">
        <div className="cipher-container max-w-5xl">
          <Link
            to="/"
            className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to CIPHER
          </Link>

          {/* Page heading */}
          <div className="mb-10">
            <span className="section-eyebrow">
              <Sparkles size={15} />
              CIPHER / WORKSPACE
            </span>

            <h1 className="section-title mt-5">
              The secret
              <br />
              <span className="text-primary">studio.</span>
            </h1>

            <p className="section-description mt-5">
              Hide a message inside an image or recover information concealed
              within a supported CIPHER image.
            </p>
          </div>

          {/* Main workspace */}
          <div className="overflow-hidden rounded-[24px] border border-base-300 bg-base-100 shadow-sm">
            {/* Mode selector */}
            <div className="grid grid-cols-2 border-b border-base-300">
              <button
                type="button"
                onClick={() => changeMode("encrypt")}
                className={`flex items-center justify-center gap-3 p-5 text-sm font-bold transition-colors ${
                  mode === "encrypt"
                    ? "bg-primary text-primary-content"
                    : "text-base-content/60 hover:bg-base-200"
                }`}
              >
                <LockKeyhole size={18} />
                Encrypt &amp; Hide
              </button>

              <button
                type="button"
                onClick={() => changeMode("decrypt")}
                className={`flex items-center justify-center gap-3 p-5 text-sm font-bold transition-colors ${
                  mode === "decrypt"
                    ? "bg-primary text-primary-content"
                    : "text-base-content/60 hover:bg-base-200"
                }`}
              >
                <UnlockKeyhole size={18} />
                Decrypt &amp; Extract
              </button>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_0.9fr] md:p-9">
              {/* Image upload */}
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">
                    {mode === "encrypt"
                      ? "01. Select your image"
                      : "01. Upload hidden image"}
                  </h2>

                  <span className="font-pixel text-[8px] text-base-content/40">
                    IMAGE FILE
                  </span>
                </div>

                <ImageUploader
                  file={file}
                  onFile={(selected) => {
                    setFile(selected);
                    resetResults();
                  }}
                />

                <div className="mt-5 flex items-start gap-3 rounded-xl bg-base-200 p-4">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-success"
                  />

                  <p className="text-xs leading-6 text-base-content/60">
                    Image processing happens locally in your browser. The
                    selected image is not uploaded to a server. Current LSB
                    hide/extract support is PNG-only; other formats are not
                    converted behind your back.
                  </p>
                </div>
              </div>

              {/* Encryption / decryption form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === "encrypt" && (
                  <div>
                    <label className="mb-3 block text-sm font-bold">
                      02. Secret message
                    </label>

                    <textarea
                      value={message}
                      onChange={(event) => {
                        setMessage(event.target.value);
                        resetResults();
                      }}
                      placeholder="Write the message you want to hide..."
                      className="textarea textarea-bordered min-h-[145px] w-full resize-y bg-base-100 text-sm leading-6"
                      maxLength={100000}
                    />

                    <p className="mt-2 text-right text-xs text-base-content/45">
                      {message.length.toLocaleString()} / 100,000 characters
                    </p>
                  </div>
                )}

                {/* Secret key */}
                {(mode === "encrypt" || needsManualKey || password.trim()) && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold">
                      {mode === "encrypt"
                        ? "03. Create secret key"
                        : "02. Secret key"}
                    </label>

                    {mode === "encrypt" && (
                      <button
                        type="button"
                        onClick={createPassword}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary"
                      >
                        <RefreshCw size={13} />
                        Generate key
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        resetResults();
                      }}
                      placeholder="Enter your secret key"
                      className="input input-bordered w-full bg-base-100 pr-12 text-sm"
                      autoComplete="off"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-base-content/50">
                    {mode === "encrypt"
                      ? "Keep this key safe. You need it to recover the message unless you choose to embed it in the image metadata."
                      : "CIPHER checks the image metadata first. Enter a key here only if automatic recovery is unavailable."}
                  </p>
                </div>
                )}

                {mode === "encrypt" && (
                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary mt-1"
                        checked={embedKeyInMetadata}
                        onChange={(event) => setEmbedKeyInMetadata(event.target.checked)}
                      />
                      <span className="text-sm">
                        <span className="block font-bold">Store secret key in PNG metadata (PNG only)</span>
                        <span className="mt-1 block text-xs leading-5 text-base-content/60">
                          Optional. CIPHER will use this key automatically during decryption.
                          Anyone who gets the image can extract this key, so the hidden message
                          will not be protected from that person.
                        </span>
                      </span>
                    </label>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="alert alert-error text-sm">
                    <span>{error}</span>
                  </div>
                )}

                {/* Success message */}
                {success && (
                  <div className="alert alert-success text-sm">
                    <Check size={17} />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="cipher-button cipher-button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Processing image...
                    </>
                  ) : mode === "encrypt" ? (
                    <>
                      <LockKeyhole size={17} />
                      Encrypt &amp; hide message
                    </>
                  ) : (
                    <>
                      <UnlockKeyhole size={17} />
                      Check image &amp; decrypt
                    </>
                  )}
                </button>

                {/* Encrypted image result */}
                {result?.type === "image" && (
                  <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                    <p className="font-bold text-success">
                      Encrypted image ready
                    </p>

                    <p className="mt-2 text-xs text-base-content/60">
                      {result.width} × {result.height} pixels. Your original
                      image remains unchanged.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        downloadBlob(result.blob, "cipher-encrypted.png")
                      }
                      className="cipher-button cipher-button-primary mt-4 w-full"
                    >
                      <ArrowDownToLine size={17} />
                      Download encrypted image (PNG)
                    </button>

                    <Link
                      to="/studio/vault"
                      state={{
                        imageFile: new File(
                          [result.blob],
                          "cipher-encrypted.png",
                          { type: "image/png" }
                        ),
                        secretKey: password,
                      }}
                      className="cipher-button cipher-button-outline mt-3 w-full"
                    >
                      <Vault size={17} />
                      Save image &amp; key to Vault
                    </Link>
                  </div>
                )}

                {/* Decrypted message result */}
                {result?.type === "message" && (
                  <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-success">
                        Secret recovered
                      </p>

                      <button
                        type="button"
                        onClick={copyMessage}
                        className="btn btn-sm btn-ghost"
                        aria-label="Copy recovered message"
                      >
                        <Copy size={15} />
                        Copy
                      </button>
                    </div>

                    <div className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-base-100 p-4 text-sm leading-7">
                      {result.message}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-7 text-center text-xs leading-6 text-base-content/45">
            CIPHER is an educational demonstration. Keep a backup of your
            original PNG and never rely on steganography as your only security
            measure.
          </p>

          {/* Other tools */}
          <div className="mt-12">
            <div className="mb-6">
              <span className="section-eyebrow">MORE CIPHER TOOLS</span>

              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em]">
                Beyond encryption.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Metadata inspector */}
              <Link
                to="/studio/metadata"
                className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileSearch size={25} />
                </div>

                <h3 className="mt-6 font-display text-xl font-bold">
                  Metadata Inspector
                </h3>

                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Explore PNG chunks, image properties and embedded metadata.
                </p>

                <span className="mt-6 inline-block text-sm font-bold text-primary">
                  Inspect image →
                </span>
              </Link>

              {/* Metadata cleaner */}
              <Link
                to="/studio/cleaner"
                className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Eraser size={25} />
                </div>

                <h3 className="mt-6 font-display text-xl font-bold">
                  Metadata Cleaner
                </h3>

                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Remove descriptive PNG metadata and supported hidden CIPHER
                  payloads.
                </p>

                <span className="mt-6 inline-block text-sm font-bold text-primary">
                  Clean image →
                </span>
              </Link>

              {/* Key Vault */}
              <Link
                to="/studio/vault"
                className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Vault size={25} />
                </div>

                <h3 className="mt-6 font-display text-xl font-bold">
                  CIPHER Key Vault
                </h3>

                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Keep image references and secret keys in this browser for 48 hours.
                </p>

                <span className="mt-6 inline-block text-sm font-bold text-primary">
                  Open your vault →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default StudioPage;
