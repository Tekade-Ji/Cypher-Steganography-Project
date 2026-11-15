
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, X, FileImage } from "lucide-react";

function ImageUploader({ file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(selected) {
    if (!selected) return;

    onFile(selected);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        selectFile(event.dataTransfer.files[0]);
      }}
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
        dragging
          ? "border-primary bg-primary/10"
          : "border-base-300 hover:border-primary/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif,.tif,.tiff,.dng,.cr2,.cr3,.nef,.arw,.raf,.rw2,.orf,.pef,.srw,.3fr,.iiq,.k25,.kdc,.dcr,.erf,.mef,.mos,.mrw,.nrw,.rwl,.x3f"
        className="hidden"
        onChange={(event) => {
          selectFile(event.target.files[0]);
          event.target.value = "";
        }}
      />

      {file && preview ? (
        <div className="p-5">
          <div className="relative overflow-hidden rounded-xl bg-base-200">
            <img
              src={preview}
              alt="Selected image preview"
              className="mx-auto max-h-[280px] w-full object-contain"
            />

            <button
              type="button"
              onClick={() => onFile(null)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-base-100 shadow-lg"
              aria-label="Remove image"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <FileImage className="text-primary" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {file.name}
              </p>

              <p className="text-xs text-base-content/50">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[280px] w-full flex-col items-center justify-center px-6 py-12 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {dragging ? (
              <ImagePlus size={30} />
            ) : (
              <Upload size={30} />
            )}
          </div>

          <h3 className="mt-6 font-display text-xl font-bold">
            Drop your image here
          </h3>

          <p className="mt-2 text-sm text-base-content/55">
            Or browse files from your device
          </p>

          <span className="mt-5 rounded-full bg-base-200 px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
            COMMON IMAGE + CAMERA FORMATS
          </span>
        </button>
      )}
    </div>
  );
}

export default ImageUploader;
