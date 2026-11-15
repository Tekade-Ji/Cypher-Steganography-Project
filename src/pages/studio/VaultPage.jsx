import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ArrowLeft,
  Copy,
  Trash2,
  Clock,
  Image as ImageIcon,
  Vault,
  Plus,
} from "lucide-react";

import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";

import {
  getLocalVaultRecords,
  saveLocalVaultRecord,
  deleteLocalVaultRecord,
} from "../../lib/vault/localVaultService";

function VaultPage() {
  const location = useLocation();
  const pendingImage = location.state?.imageFile || null;
  const pendingKey = location.state?.secretKey || "";

  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refreshRecords() {
    const data = await getLocalVaultRecords();
    setRecords(data);
  }

  useEffect(() => {
    refreshRecords()
      .catch((err) => setError(err.message || "Unable to access browser storage."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!pendingImage || !pendingKey) {
      setError("No pending image or secret key was provided. Return to Studio and create an encrypted image first.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await saveLocalVaultRecord(pendingImage, pendingKey);
      await refreshRecords();
      setMessage("Image reference and key saved in this browser.");
    } catch (err) {
      setError(err.message || "Unable to save this record.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this local Vault record?")) return;

    try {
      await deleteLocalVaultRecord(id);
      setRecords((current) => current.filter((record) => record.id !== id));
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
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return `${hours}h ${minutes}m remaining`;
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
            <ArrowLeft size={16} />
            Back to Studio
          </Link>

          <div className="mb-10">
            <span className="section-eyebrow">
              <Vault size={15} />
              CIPHER / LOCAL STORAGE
            </span>

            <h1 className="section-title mt-5">
              Your references.
              <br />
              <span className="text-primary">Your vault.</span>
            </h1>

            <p className="section-description mt-5">
              Keep image references and their secret keys together in this browser.
              Records expire automatically after 48 hours.
            </p>
          </div>

          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-5">
            <Vault className="mt-0.5 shrink-0 text-success" size={20} />
            <p className="text-sm leading-6 text-base-content/70">
              Your Vault stays on this device. Image references and saved keys are
              stored locally in this browser, never uploaded to a CIPHER server.
              Records expire automatically after 48 hours.
            </p>
          </div>

          {pendingImage && pendingKey && (
            <div className="mb-7 rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-3">
                <Plus className="text-primary" />
                <h2 className="font-display text-lg font-bold">Save this image reference</h2>
              </div>
              <p className="mt-3 text-sm text-base-content/60">
                {pendingImage.name} is ready to be saved with its secret key.
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="cipher-button cipher-button-primary mt-5"
              >
                {saving ? <span className="loading loading-spinner loading-sm" /> : <Plus size={16} />}
                Save to local Vault
              </button>
            </div>
          )}

          {message && <div className="alert alert-success mb-6 text-sm">{message}</div>}
          {error && <div className="alert alert-error mb-6 text-sm">{error}</div>}

          {loading ? (
            <div className="py-16 text-center">
              <span className="loading loading-spinner loading-lg" />
              <p className="mt-3 text-sm text-base-content/50">Opening local Vault...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-16 text-center">
              <ImageIcon size={40} className="mx-auto text-base-content/25" />
              <h2 className="mt-5 font-display text-xl font-bold">Nothing hidden here. Yet.</h2>
              <p className="mt-2 text-sm text-base-content/50">
                Save an image reference from the Studio to see it here.
              </p>
              <Link to="/studio" className="cipher-button cipher-button-primary mt-6">
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
                    <h3 className="truncate font-display font-bold">{record.imageName}</h3>
                    <p className="mt-2 text-xs text-base-content/50">
                      {(record.imageSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-warning">
                      <Clock size={14} />
                      {remainingTime(record.expiresAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyKey(record.secretKey)}
                      className="cipher-button cipher-button-primary mt-5 w-full"
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
        </div>
      </main>

      <Footer />
    </>
  );
}

export default VaultPage;
