import { useState } from "react";
import {
  ArrowLeft,
  Eraser,
  ShieldCheck,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router";

import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";
import ImageUploader from "../../components/studio/ImageUploader";

import { cleanPNGMetadata } from "../../lib/image/pngCleaner";
import { downloadBlob } from "../../lib/image/png";

function CleanerPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClean() {
    if (!file) {
      setError("Select a PNG image first.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    try {
      const output = await cleanPNGMetadata(file);

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

      <main className="min-h-screen bg-base-200 py-14 md:py-20">
        <div className="cipher-container max-w-4xl">
          <Link
            to="/studio"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Studio
          </Link>

          <span className="section-eyebrow">
            <Eraser size={15} />
            IMAGE INTELLIGENCE / 002
          </span>

          <h1 className="section-title mt-5">
            Clean the
            <br />
            <span className="text-secondary">unnecessary.</span>
          </h1>

          <p className="section-description mt-5">
            Remove descriptive metadata from PNG images while preserving image
            data and important rendering information.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
              <h2 className="mb-5 font-display text-xl font-bold">
                Select your image
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
                onClick={handleClean}
                disabled={!file || loading}
                className="cipher-button cipher-button-primary mt-5 w-full disabled:opacity-50"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Eraser size={17} />
                )}
                Clean image metadata
              </button>

              {error && (
                <div className="alert alert-error mt-4 text-sm">{error}</div>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
                <ShieldCheck size={27} className="text-success" />

                <h3 className="mt-4 font-display text-xl font-bold">
                  What will be preserved?
                </h3>

                <ul className="mt-5 space-y-3 text-sm leading-6 text-base-content/65">
                  <li>✓ Original image pixel data</li>
                  <li>✓ Image dimensions</li>
                  <li>✓ Transparency information</li>
                  <li>✓ Required colour information</li>
                  <li>✓ PNG compression data</li>
                </ul>
              </div>

              

              {result && (
                <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
                  <div className="flex items-center gap-2 font-bold text-success">
                    <CheckCircle2 size={19} />
                    Metadata cleaning complete
                  </div>

                  <p className="mt-3 text-sm text-base-content/65">
                    Removed {result.removed.length} metadata chunks.
                  </p>

                  <div className="mt-4 rounded-lg bg-base-200 p-4 text-sm">
                    <p>
                      <strong>Hidden CIPHER payload:</strong> Left unchanged
                    </p>
                    <p className="mt-2 text-xs text-base-content/55">
                      Metadata cleanup does not modify hidden message bits. Use
                      the separate Payload Cleaner when you want to remove them.
                    </p>
                  </div>

                  <p className="mt-2 text-xs text-base-content/50">
                    Preserved {result.preserved.length} image chunks.
                  </p>

                  <div className="mt-5">
                    <button
                      onClick={() =>
                        downloadBlob(result.blob, "cipher-cleaned.png")
                      }
                      className="cipher-button cipher-button-primary w-full"
                    >
                      <Download size={17} />
                      Download cleaned PNG
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default CleanerPage;
