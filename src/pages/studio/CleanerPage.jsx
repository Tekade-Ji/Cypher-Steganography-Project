import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Eraser,
  ShieldCheck,
  Download,
  CheckCircle2,
  SlidersHorizontal,
  FileSearch,
  FilePenLine,
  Vault,
} from "lucide-react";
import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";
import ImageUploader from "../../components/studio/ImageUploader";
import { cleanPNGMetadata, inspectPNGChunks } from "../../lib/image/pngCleaner";
import { downloadBlob } from "../../lib/image/png";

const groups = [
  { label: "Camera / EXIF information", types: ["eXIf"] },
  { label: "Text, comments and descriptions", types: ["tEXt", "zTXt", "iTXt"] },
  { label: "Modification timestamp", types: ["tIME"] },
  { label: "Physical dimensions metadata", types: ["pHYs"] },
  {
    label: "Colour profile information",
    types: ["iCCP", "gAMA", "cHRM", "sRGB", "sBIT"],
  },
];

function CleanerPage() {
  const [file, setFile] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [all, setAll] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!file) {
      setChunks([]);
      setSelected([]);
      return undefined;
    }
    inspectPNGChunks(file)
      .then((items) => {
        if (active)
          setChunks(
            items.filter(
              (item) =>
                !["IHDR", "IDAT", "IEND", "PLTE", "tRNS"].includes(item.type),
            ),
          );
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [file]);

  function chooseFile(next) {
    setFile(next);
    setResult(null);
    setError("");
    setSelected([]);
    setAll(Boolean(next && next.type !== "image/png"));
  }

  function toggle(id) {
    setAll(false);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function selectGroup(types) {
    const ids = chunks
      .filter((item) => types.includes(item.type))
      .map((item) => item.id);
    const allSelected =
      ids.length > 0 && ids.every((id) => selected.includes(id));
    setAll(false);
    setSelected((current) =>
      allSelected
        ? current.filter((id) => !ids.includes(id))
        : [...new Set([...current, ...ids])],
    );
  }

  async function handleClean() {
    if (!file) {
      setError("Select an image first.");
      return;
    }
    if (!all && selected.length === 0) {
      setError("Choose at least one metadata item to remove.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const output = await cleanPNGMetadata(
        file,
        all ? { selectedChunks: ["all"] } : { selectedChunkIds: selected },
      );
      setResult(output);
    } catch (err) {
      setError(err.message || "Unable to clean this image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-200 py-14 md:py-20">
        <div className="cipher-container max-w-5xl">
          <Link
            to="/studio"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Studio
          </Link>
          <span className="section-eyebrow">
            <Eraser size={15} /> IMAGE INTELLIGENCE / 002
          </span>
          <h1 className="section-title mt-5">
            Clean the <span className="text-secondary">unnecessary.</span>
          </h1>
          <p className="section-description mt-5">
            Choose individual metadata entries or remove all removable metadata.
            Hidden CIPHER pixel data is kept separate and is not cleared by this
            tool.
          </p>

          <div className="mt-10 grid items-start gap-7 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="mb-5 font-display text-xl font-bold">
                Select an image
              </h2>
              <ImageUploader file={file} onFile={chooseFile} />
              <div className="mt-5 rounded-xl bg-base-200 p-4 text-xs leading-6 text-base-content/60">
                The cleaned result is exported as PNG. For non-PNG uploads,
                CIPHER normalizes the decoded image to PNG before cleaning.
                Original container metadata that the browser does not carry over
                cannot be selectively retained.
              </div>
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
                Clean selected metadata
              </button>
              {error && (
                <div className="alert alert-error mt-4 text-sm">{error}</div>
              )}
            </section>

            <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="text-primary" />
                <div>
                  <h2 className="font-display text-xl font-bold">
                    Choose what to remove
                  </h2>
                  <p className="text-xs text-base-content/50">
                    Individual entries are listed when available
                  </p>
                </div>
              </div>
              {file ? (
                <>
                  {file.type === "image/png" && (
                    <p className="mt-4 text-xs leading-5 text-base-content/50">
                      Text entries can be removed one by one. The EXIF item is a
                      single metadata block in PNG, so removing it removes its
                      camera, date and GPS tags together.
                    </p>
                  )}
                  {file.type !== "image/png" ? (
                    <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm font-bold">
                        Normalize and remove source metadata
                      </p>
                      <p className="mt-2 text-xs leading-6 text-base-content/60">
                        This format is decoded and exported as PNG. Browser
                        canvas export does not carry the source file's EXIF,
                        GPS, XMP or other container metadata into the new PNG.
                        Individual source metadata fields cannot be selectively
                        edited in this workflow.
                      </p>
                    </div>
                  ) : (
                    <>
                      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={all}
                          onChange={(e) => {
                            setAll(e.target.checked);
                            setSelected([]);
                          }}
                        />
                        <span>
                          <strong className="block text-sm">
                            Remove all removable metadata
                          </strong>
                          <span className="text-xs text-base-content/55">
                            Keeps image-critical chunks and colour rendering
                            data
                          </span>
                        </span>
                      </label>
                      <div className="mt-5 space-y-4">
                        {groups.map((group) => {
                          const entries = chunks.filter((item) =>
                            group.types.includes(item.type),
                          );
                          if (!entries.length) return null;
                          const ids = entries.map((item) => item.id);
                          const checked = ids.every((id) =>
                            selected.includes(id),
                          );
                          return (
                            <div
                              key={group.label}
                              className="rounded-xl border border-base-300 p-4"
                            >
                              <label className="flex cursor-pointer items-center justify-between gap-3">
                                <span className="text-sm font-bold">
                                  {group.label}
                                </span>
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-sm checkbox-primary"
                                  checked={checked}
                                  disabled={all}
                                  onChange={() => selectGroup(group.types)}
                                />
                              </label>
                              <div className="mt-3 space-y-2">
                                {entries.map((item) => (
                                  <label
                                    key={item.id}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-base-200/70 px-3 py-2 text-xs"
                                  >
                                    <span>
                                      <strong>
                                        {item.keyword || item.type}
                                      </strong>
                                      <span className="ml-2 text-base-content/50">
                                        {item.keyword
                                          ? `${item.type} · ${item.description}`
                                          : item.description}
                                      </span>
                                    </span>
                                    <input
                                      type="checkbox"
                                      className="checkbox checkbox-xs checkbox-primary"
                                      checked={
                                        all || selected.includes(item.id)
                                      }
                                      disabled={all}
                                      onChange={() => toggle(item.id)}
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        {chunks.length === 0 && (
                          <p className="mt-5 rounded-xl bg-base-200 p-4 text-sm text-base-content/60">
                            No removable PNG metadata chunks were detected after
                            decoding this image.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="mt-5 rounded-xl bg-base-200 p-5 text-sm text-base-content/55">
                  Choose an image to inspect its removable metadata entries.
                </p>
              )}
            </section>
          </div>

          {result && (
            <div className="mt-7 rounded-2xl border border-success/30 bg-success/5 p-6">
              <div className="flex items-center gap-2 font-bold text-success">
                <CheckCircle2 size={19} />
                Metadata cleanup complete
              </div>
              <p className="mt-3 text-sm text-base-content/65">
                Removed {result.removed.length} metadata chunks. Preserved{" "}
                {result.preserved.length} image chunks.
              </p>
              <p className="mt-2 text-xs leading-6 text-base-content/55">
                {result.note}
              </p>
              <p className="mt-2 text-xs text-base-content/55">
                Hidden CIPHER payload: preserved by this operation.
              </p>
              <button
                onClick={() => downloadBlob(result.blob, "cipher-cleaned.png")}
                className="cipher-button cipher-button-primary mt-5"
              >
                <Download size={17} />
                Download cleaned PNG
              </button>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-success/20 bg-success/5 p-5">
            <ShieldCheck className="text-success" size={24} />
            <h3 className="mt-3 font-bold">
              Separate controls, predictable results
            </h3>
            <p className="mt-2 text-xs leading-6 text-base-content/60">
              Metadata removal does not clear the hidden message. To remove
              CIPHER pixel payload data, use the separate Payload Cleaner.
            </p>
            <Link
              to="/studio/clear-payload"
              className="mt-3 inline-flex text-sm font-bold text-primary"
            >
              Open Payload Cleaner →
            </Link>
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
export default CleanerPage;
