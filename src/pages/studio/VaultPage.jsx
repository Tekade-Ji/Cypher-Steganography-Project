import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Copy,
  Trash2,
  Clock,
  Image as ImageIcon,
  Vault,
  Download,
  FilePenLine,
  FileSearch,
  Eraser, 
} from "lucide-react";
import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";
import {
  getLocalVaultRecords,
  deleteLocalVaultRecord,
} from "../../lib/vault/localVaultService";
import { downloadBlob } from "../../lib/image/png";

function VaultPage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function refreshRecords() {
    const data = await getLocalVaultRecords();
    setRecords(data);
  }

  useEffect(() => {
    refreshRecords()
      .catch((err) =>
        setError(err.message || "Unable to access browser storage."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this local Vault record?")) return;
    try {
      await deleteLocalVaultRecord(id);
      setRecords((current) => current.filter((record) => record.id !== id));
      setMessage("Vault record deleted.");
    } catch (err) {
      setError(err.message || "Unable to delete this record.");
    }
  }

  async function copyKey(key) {
    try {
      await navigator.clipboard.writeText(key);
      setMessage("Secret key copied to clipboard.");
      setError("");
    } catch {
      setError("Unable to access the clipboard.");
    }
  }

  function remainingTime(expiresAt) {
    const remaining = Math.max(0, expiresAt - Date.now());
    return `${Math.floor(remaining / 3600000)}h ${Math.floor((remaining % 3600000) / 60000)}m remaining`;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-200 py-14 md:py-20">
        <div className="cipher-container max-w-5xl">
          <Link
            to="/studio"
            className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-primary"
          >
            <ArrowLeft size={16} /> Back to Studio
          </Link>
          <div className="mb-10">
            <span className="section-eyebrow">
              <Vault size={15} /> CIPHER / LOCAL STORAGE
            </span>
            <h1 className="section-title mt-5">
              Your references.
              <br />
              <span className="text-primary">Your vault.</span>
            </h1>
            <p className="section-description mt-5">
              Encrypted images and their keys are saved automatically here for
              48 hours.
            </p>
          </div>
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-5">
            <Vault className="mt-0.5 shrink-0 text-success" size={20} />
            <p className="text-sm leading-6 text-base-content/70">
              Your Vault stays in this browser on your device. Images and keys
              are stored locally and are never uploaded to a CIPHER server.
              Records expire automatically after 48 hours.
            </p>
          </div>
          {message && (
            <div className="alert alert-success mb-6 text-sm">{message}</div>
          )}
          {error && (
            <div className="alert alert-error mb-6 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="py-16 text-center">
              <span className="loading loading-spinner loading-lg" />
              <p className="mt-3 text-sm text-base-content/50">
                Opening local Vault...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
              <ImageIcon size={40} className="mx-auto text-base-content/25" />
              <h2 className="mt-5 font-display text-xl font-bold">
                Your Vault is empty
              </h2>
              <p className="mt-2 text-sm text-base-content/50">
                Create an encrypted image in Studio and it will appear here
                automatically.
              </p>
              <Link
                to="/studio"
                className="cipher-button cipher-button-primary mt-6"
              >
                Create encrypted image
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {records.map((record) => (
                <article
                  key={record.id}
                  className="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
                >
                  <div className="flex aspect-[16/10] items-center justify-center bg-base-200 p-3">
                    {record.thumbnail ? (
                      <img
                        src={record.thumbnail}
                        alt="Saved image thumbnail"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <ImageIcon size={36} className="text-base-content/30" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="truncate font-display font-bold">
                      {record.imageName}
                    </h3>
                    <p className="mt-2 text-xs text-base-content/50">
                      {(record.imageSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-warning">
                      <Clock size={14} />
                      {remainingTime(record.expiresAt)}
                    </div>
                    {record.imageBlob && (
                      <button
                        type="button"
                        onClick={() =>
                          downloadBlob(
                            record.imageBlob,
                            record.imageName || "cipher-encrypted.png",
                          )
                        }
                        className="cipher-button cipher-button-outline mt-5 w-full"
                      >
                        <Download size={15} />
                        Download saved image
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyKey(record.secretKey)}
                      className="cipher-button cipher-button-primary mt-3 w-full"
                    >
                      <Copy size={15} />
                      Copy secret key
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-error"
                    >
                      <Trash2 size={14} />
                      Delete record
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

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

              {/* Hidden payload cleaner */}
              <Link
                to="/studio/clear-payload"
                className="group rounded-2xl border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <Eraser size={25} />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">
                  Payload Cleaner
                </h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Clear a hidden CIPHER message from pixel data without its
                  secret key.
                </p>
                <span className="mt-6 inline-block text-sm font-bold text-primary">
                  Clear hidden data →
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
export default VaultPage;
