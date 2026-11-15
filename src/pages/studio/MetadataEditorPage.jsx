import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, FilePenLine, Download, Save, ShieldCheck, FileSearch, Eraser, Vault } from "lucide-react";
import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";
import ImageUploader from "../../components/studio/ImageUploader";
import { normalizeToPNG, downloadBlob } from "../../lib/image/png";
import { writePNGMetadata } from "../../lib/image/metadataEditor";

const fields = [
  ["Title", "Image title"],
  ["Author", "Photographer or creator"],
  ["Description", "A short description of this image"],
  ["Copyright", "Copyright notice"],
  ["Software", "Software used to create or edit the image"],
  ["Comment", "Additional note"],
];

function MetadataEditorPage() {
  const [file, setFile] = useState(null);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function chooseFile(next) {
    setFile(next);
    setResult(null);
    setError("");
  }

  async function handleSave() {
    if (!file) { setError("Select an image first."); return; }
    if (!Object.values(values).some((value) => String(value || "").trim())) {
      setError("Enter at least one metadata value to write.");
      return;
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const normalized = file.type === "image/png"
        ? { blob: file, sourceFormat: "image/png" }
        : await normalizeToPNG(file);
      const bitmap = await createImageBitmap(normalized.blob);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close?.();
      const blob = await writePNGMetadata(normalized.blob, values);
      setResult({ blob, width, height, sourceFormat: normalized.sourceFormat });
    } catch (err) { setError(err.message || "Unable to edit image metadata."); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base-200 py-14 md:py-20">
        <div className="cipher-container max-w-5xl">
          <Link to="/studio" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 hover:text-primary"><ArrowLeft size={16} />Back to Studio</Link>
          <span className="section-eyebrow"><FilePenLine size={15} /> IMAGE INTELLIGENCE / 004</span>
          <h1 className="section-title mt-5">Give your image <span className="text-primary">context.</span></h1>
          <p className="section-description mt-5">Add or update common descriptive metadata fields and export an edited PNG image.</p>

          <div className="mt-10 grid items-start gap-7 md:grid-cols-2">
            <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="mb-5 font-display text-xl font-bold">Choose an image</h2>
              <ImageUploader file={file} onFile={chooseFile} />
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-success/5 p-4">
                <ShieldCheck className="mt-0.5 shrink-0 text-success" size={19} />
                <p className="text-xs leading-6 text-base-content/60">Editing runs locally in your browser. The output is PNG so the image can retain lossless pixel data and the added metadata.</p>
              </div>
            </section>

            <section className="rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="mb-2 font-display text-xl font-bold">Edit descriptive fields</h2>
              <p className="mb-5 text-xs leading-6 text-base-content/50">Leave a field blank if you do not want to add or update it.</p>
              <div className="space-y-4">
                {fields.map(([name, placeholder]) => <label key={name} className="block">
                  <span className="mb-2 block text-sm font-semibold">{name}</span>
                  {name === "Description" || name === "Comment"
                    ? <textarea value={values[name] || ""} onChange={(e) => setValues((old) => ({ ...old, [name]: e.target.value }))} placeholder={placeholder} rows={3} className="textarea textarea-bordered w-full bg-base-100" />
                    : <input value={values[name] || ""} onChange={(e) => setValues((old) => ({ ...old, [name]: e.target.value }))} placeholder={placeholder} className="input input-bordered w-full bg-base-100" />}
                </label>)}
              </div>
              {error && <div className="alert alert-error mt-5 text-sm">{error}</div>}
              <button type="button" onClick={handleSave} disabled={!file || loading} className="cipher-button cipher-button-primary mt-6 w-full disabled:opacity-50">
                {loading ? <span className="loading loading-spinner loading-sm" /> : <Save size={17} />}Apply metadata
              </button>
            </section>
          </div>

          {result && <div className="mt-7 rounded-2xl border border-success/30 bg-success/5 p-6">
            <h3 className="font-bold text-success">Metadata updated successfully</h3>
            <p className="mt-2 text-sm text-base-content/60">{result.width} × {result.height} pixels. Source format: {result.sourceFormat}. Output format: PNG.</p>
            <button onClick={() => downloadBlob(result.blob, "cipher-metadata-edited.png")} className="cipher-button cipher-button-primary mt-5"><Download size={17} />Download edited PNG</button>
          </div>}
          <p className="mt-8 text-xs leading-6 text-base-content/45">This editor writes common PNG text metadata fields. It does not modify embedded camera EXIF, GPS coordinates or original capture timestamps.</p>

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
                <h3 className="mt-6 font-display text-xl font-bold">Encrypt / Decrypt Image</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Write or extract a secret message from an image
                </p>
                <span className="mt-6 inline-block text-sm font-bold text-primary">Encrypt/Decrypt Image →</span>
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
                <h3 className="mt-6 font-display text-xl font-bold">Payload Cleaner</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  Clear a hidden CIPHER message from pixel data without its secret key.
                </p>
                <span className="mt-6 inline-block text-sm font-bold text-primary">Clear hidden data →</span>
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
export default MetadataEditorPage;
