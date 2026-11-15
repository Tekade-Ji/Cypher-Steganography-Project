import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Eraser,
  Download,
  ShieldAlert,
  FileSearch,
  FilePenLine,
  Vault,
} from "lucide-react";

import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";
import ImageUploader from "../../components/studio/ImageUploader";

import { removeHiddenPayload } from "../../lib/steganography/cipherService";
import { downloadBlob } from "../../lib/image/png";

function PayloadCleanerPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClear() {
    if (!file) {
      setError("Select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const output = await removeHiddenPayload(file);
      setResult(output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-200 py-16">
        <div className="cipher-container max-w-4xl">
          <Link
            to="/studio"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60"
          >
            <ArrowLeft size={16} />
            Back to Studio
          </Link>

          <span className="section-eyebrow">IMAGE INTELLIGENCE / 003</span>

          <h1 className="section-title mt-5">
            Remove the
            <br />
            <span className="text-secondary">hidden layer.</span>
          </h1>

          <p className="section-description mt-5">
            Remove an embedded CIPHER payload from an image without needing its
            encryption password.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
              <h2 className="mb-5 font-display text-xl font-bold">
                Select encrypted image
              </h2>

              <ImageUploader
                file={file}
                onFile={(selected) => {
                  setFile(selected);
                  setResult(null);
                  setError("");
                }}
              />

              <button
                onClick={handleClear}
                disabled={!file || loading}
                className="cipher-button cipher-button-primary mt-5 w-full disabled:opacity-50"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Eraser size={17} />
                )}
                Remove hidden payload
              </button>

              {error && (
                <div className="alert alert-error mt-4 text-sm">{error}</div>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6">
                <ShieldAlert size={28} className="text-warning" />

                <h3 className="mt-4 font-display text-xl font-bold">
                  Important
                </h3>

                <p className="mt-3 text-sm leading-7 text-base-content/65">
                  This operation does not decrypt your message. It overwrites
                  the embedded CIPHER payload bits. The original message cannot
                  be recovered from the cleaned output.
                </p>
              </div>

              {result && (
                <div className="rounded-2xl border border-success/30 bg-success/5 p-6">
                  <h3 className="font-bold text-success">Payload removed</h3>

                  <p className="mt-3 text-sm text-base-content/60">
                    Processed {result.clearedBytes} bytes of embedded payload.
                  </p>

                  <button
                    onClick={() =>
                      downloadBlob(result.blob, "cipher-payload-cleared.png")
                    }
                    className="cipher-button cipher-button-primary mt-5 w-full"
                  >
                    <Download size={17} />
                    Download cleaned image
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Other tools */}
          <div className="mt-12">
            <div className="mb-6">
              <span className="section-eyebrow">MORE CIPHER TOOLS</span>

              <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.06em]">
                Beyond encryption.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Encrypt/Decrypt Image */}
              <Link
                to="/studio"
                className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <FilePenLine size={25} />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">
                  Encrypt / Decrypt Image
                </h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Write or extract a secret message from an image
                </p>
                <span className="mt-6 inline-block text-sm font-bold text-primary">
                  Encrypt/Decrypt Image →
                </span>
              </Link>

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

              {/* Metadata editor */}
              <Link
                to="/studio/metadata-editor"
                className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <FilePenLine size={25} />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">
                  Metadata Editor
                </h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Add titles, author details, descriptions and copyright
                  information.
                </p>
                <span className="mt-6 inline-block text-sm font-bold text-primary">
                  Edit metadata →
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
                  Keep image references and secret keys in this browser for 48
                  hours.
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

export default PayloadCleanerPage;
