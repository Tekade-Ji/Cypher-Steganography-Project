
import { useState } from "react";
import { Link } from "react-router";

import {
  ArrowLeft,
  FileSearch,
  ScanSearch,
  ShieldCheck,
  MapPin,
  Navigation,
  ExternalLink,
} from "lucide-react";

import Navbar from "../../components/navigation/Navbar";
import Footer from "../../sections/footer/Footer";

import ImageUploader from "../../components/studio/ImageUploader";
import MetadataTable from "../../components/studio/MetadataTable";

import { inspectImage } from "../../lib/image/pngMetadata";

import {
  lookupPhotoLocation,
  createMapUrl,
  createGoogleMapsUrl,
} from "../../lib/image/reverseGeocode";


function formatMetadataDate(value) {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  let date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    date = new Date(value);
  } else {
    // Handle common EXIF date format:
    // YYYY:MM:DD HH:mm:ss
    const normalized = String(value).replace(
      /^(\d{4}):(\d{2}):(\d{2})\s/,
      "$1-$2-$3T",
    );

    date = new Date(normalized);
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(date);
}


function MetadataPage() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");


  function handleFileChange(selected) {
    setFile(selected);
    setReport(null);

    setError("");
    setLocation(null);
    setLocationError("");
  }


  async function handleInspect() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);

    setError("");
    setReport(null);
    setLocation(null);
    setLocationError("");

    try {
      const result = await inspectImage(file);

      setReport(result);
    } catch (err) {
      setError(
        err.message || "Unable to inspect this image.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleLocationLookup() {
    const latitude = report?.exif?.gps?.latitude;
    const longitude = report?.exif?.gps?.longitude;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setLocationError(
        "This image does not contain usable GPS coordinates.",
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setLocation(null);

    try {
      const result = await lookupPhotoLocation(
        latitude,
        longitude,
      );

      setLocation(result);
    } catch (err) {
      setLocationError(
        err.message || "Unable to identify this location.",
      );
    } finally {
      setLocationLoading(false);
    }
  }


  const gps = report?.exif?.gps;

  const hasGPS =
    Number.isFinite(gps?.latitude) &&
    Number.isFinite(gps?.longitude);


  const imageRows = report
    ? [
        {
          label: "Filename",
          value: report.file.name,
        },
        {
          label: "File size",
          value: `${report.file.sizeKB} KB`,
        },
        {
          label: "File format",
          value: report.file.type,
        },
        {
          label: "Dimensions",
          value: `${report.image.width} × ${report.image.height} pixels`,
        },
        {
          label: "Megapixels",
          value: report.image.megapixels,
        },
        {
          label: "Bit depth",
          value: report.image.bitDepth,
        },
        {
          label: "Colour type",
          value: report.image.colourTypeName,
        },
        {
          label: "Interlacing",
          value: report.image.interlaceMethod,
        },
        {
          label: "Compression method",
          value: report.image.compressionMethod,
        },
        {
          label: "Filter method",
          value: report.image.filterMethod,
        },
      ]
    : [];


  const timelineRows = report
    ? [
        {
          label: "Original capture",
          description: "EXIF DateTimeOriginal",
          value: formatMetadataDate(
            report.exif.dates.captured,
          ),
        },
        {
          label: "Digitization date",
          description: "EXIF DateTimeDigitized",
          value: formatMetadataDate(
            report.exif.dates.digitized,
          ),
        },
        {
          label: "Embedded creation date",
          description: "EXIF/XMP creation timestamp",
          value: formatMetadataDate(
            report.exif.dates.created,
          ),
        },
        {
          label: "Last modification",
          description: "EXIF ModifyDate",
          value: formatMetadataDate(
            report.exif.dates.modified,
          ),
        },
        {
          label: "Metadata modification",
          description: "XMP MetadataDate",
          value: formatMetadataDate(
            report.exif.dates.metadataModified,
          ),
        },
        {
          label: "GPS date",
          description: "GPSDateStamp",
          value: report.exif.dates.gpsDate || "Not recorded",
        },
        {
          label: "GPS time",
          description: "GPS time reference, generally UTC",
          value: report.exif.dates.gpsTime
            ? String(report.exif.dates.gpsTime)
            : "Not recorded",
        },
        {
          label: "Original timezone",
          value:
            report.exif.dates.originalOffset ||
            "Not recorded",
        },
        {
          label: "Modification timezone",
          value:
            report.exif.dates.modifiedOffset ||
            "Not recorded",
        },
        {
          label: "File modification timestamp",
          description:
            "Browser File.lastModified (filesystem timestamp)",
          value: formatMetadataDate(
            report.file.lastModified,
          ),
        },
      ]
    : [];


  const cameraRows = report
    ? [
        {
          label: "Manufacturer",
          value: report.exif.camera.make || "Unknown",
        },
        {
          label: "Camera model",
          value: report.exif.camera.model || "Unknown",
        },
        {
          label: "Lens",
          value: report.exif.camera.lens || "Not recorded",
        },
        {
          label: "Software",
          value: report.exif.camera.software || "Not recorded",
        },
        {
          label: "Artist",
          value: report.exif.camera.artist || "Not recorded",
        },
        {
          label: "Copyright",
          value: report.exif.camera.copyright || "Not recorded",
        },
        {
          label: "Description",
          value: report.exif.camera.description || "Not recorded",
        },
        {
          label: "Orientation",
          value:
            report.exif.camera.orientation ?? "Not recorded",
        },
        {
          label: "ISO",
          value: report.exif.camera.iso ?? "Not recorded",
        },
        {
          label: "Aperture",
          value: report.exif.camera.aperture
            ? `f/${report.exif.camera.aperture}`
            : "Not recorded",
        },
        {
          label: "Exposure time",
          value: report.exif.camera.exposure
            ? `${report.exif.camera.exposure}s`
            : "Not recorded",
        },
        {
          label: "Focal length",
          value: report.exif.camera.focalLength
            ? `${report.exif.camera.focalLength} mm`
            : "Not recorded",
        },
      ]
    : [];


  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base-200 py-14 md:py-20">

        <div className="cipher-container max-w-5xl">

          {/* Back navigation */}

          <Link
            to="/studio"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            Back to Studio
          </Link>


          {/* Page heading */}

          <div className="mb-10">

            <span className="section-eyebrow">
              <FileSearch size={15} />
              IMAGE INTELLIGENCE / 001
            </span>

            <h1 className="section-title mt-5">
              Look beyond
              <br />
              <span className="text-primary">
                the pixels.
              </span>
            </h1>

            <p className="section-description mt-5">
              Explore the hidden information inside your images.
              Inspect image properties, capture history, camera
              information, geographical coordinates and embedded
              metadata.
            </p>

          </div>


          {/* Main layout */}

          <div className="grid items-start gap-7 lg:grid-cols-[0.85fr_1.15fr]">


            {/* Left column */}

            <div className="space-y-5">

              <div className="rounded-2xl border border-base-300 bg-base-100 p-5">

                <h2 className="mb-5 font-display text-xl font-bold">
                  Select an image
                </h2>

                <ImageUploader
                  file={file}
                  onFile={handleFileChange}
                />

                <button
                  type="button"
                  onClick={handleInspect}
                  disabled={!file || loading}
                  className="cipher-button cipher-button-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <ScanSearch size={17} />
                  )}

                  {loading
                    ? "Inspecting image..."
                    : "Inspect image"}

                </button>


                {error && (
                  <div className="alert alert-error mt-4 text-sm">
                    {error}
                  </div>
                )}

              </div>


              {/* Privacy information */}

              <div className="rounded-2xl border border-success/20 bg-success/5 p-5">

                <ShieldCheck
                  className="text-success"
                  size={24}
                />

                <h3 className="mt-3 font-bold">
                  Private inspection
                </h3>

                <p className="mt-2 text-xs leading-6 text-base-content/60">
                  Image inspection happens locally inside your
                  browser. Your original image is not uploaded
                  to a CIPHER server.
                </p>

              </div>


              {/* Location privacy notice */}

              <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">

                <MapPin
                  className="text-warning"
                  size={23}
                />

                <h3 className="mt-3 font-bold">
                  Location privacy
                </h3>

                <p className="mt-2 text-xs leading-6 text-base-content/60">
                  Reverse geocoding sends the extracted GPS
                  coordinates to an external mapping service
                  only when you request a location lookup.
                </p>

              </div>

            </div>


            {/* Right column */}

            <div className="space-y-5">


              {!report ? (

                <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center">

                  <FileSearch
                    size={42}
                    className="text-base-content/25"
                  />

                  <h3 className="mt-5 font-display text-xl font-bold">
                    Waiting for an image
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-base-content/50">
                    Select an image and inspect the metadata your browser can read.
                    Your complete metadata report will
                    appear here.
                  </p>

                </div>

              ) : (

                <>

                  {/* Statistics */}

                  <div className="grid grid-cols-3 gap-3">

                    {[
                      [
                        "FORMAT DETAILS",
                        report.summary.totalChunks,
                      ],
                      [
                        "METADATA",
                        report.summary.metadataChunks,
                      ],
                      [
                        "TEXT ENTRIES",
                        report.summary.textEntries,
                      ],
                    ].map(([label, value]) => (

                      <div
                        key={label}
                        className="rounded-xl border border-base-300 bg-base-100 p-4"
                      >

                        <p className="font-pixel text-[7px] text-base-content/45">
                          {label}
                        </p>

                        <p className="mt-3 font-display text-3xl font-bold">
                          {value}
                        </p>

                      </div>

                    ))}

                  </div>


                  {/* Image properties */}

                  <MetadataTable
                    title="Image properties"
                    rows={imageRows}
                  />


                  {/* Image timeline */}

                  <MetadataTable
                    title="Image timeline"
                    rows={timelineRows}
                  />


                  {/* Camera information */}

                  <MetadataTable
                    title="Camera and image origin"
                    rows={cameraRows}
                  />


                  {/* GPS location */}

                  <section className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">

                    <div className="border-b border-base-300 p-5">

                      <div className="flex items-center gap-3">

                        <MapPin
                          className="text-primary"
                          size={23}
                        />

                        <div>

                          <h3 className="font-display text-xl font-bold">
                            Photograph location
                          </h3>

                          <p className="mt-1 text-xs text-base-content/50">
                            Extracted from embedded GPS metadata
                          </p>

                        </div>

                      </div>

                    </div>


                    <div className="p-5">

                      {hasGPS ? (

                        <>

                          {/* Coordinates */}

                          <div className="grid grid-cols-2 gap-3">

                            <div className="rounded-xl bg-base-200 p-4">

                              <p className="text-xs text-base-content/50">
                                LATITUDE
                              </p>

                              <p className="mt-2 break-all font-display text-lg font-bold">
                                {gps.latitude.toFixed(7)}°
                              </p>

                            </div>


                            <div className="rounded-xl bg-base-200 p-4">

                              <p className="text-xs text-base-content/50">
                                LONGITUDE
                              </p>

                              <p className="mt-2 break-all font-display text-lg font-bold">
                                {gps.longitude.toFixed(7)}°
                              </p>

                            </div>


                            <div className="rounded-xl bg-base-200 p-4">

                              <p className="text-xs text-base-content/50">
                                ALTITUDE
                              </p>

                              <p className="mt-2 font-display text-lg font-bold">

                                {gps.altitude !== null
                                  ? `${gps.altitude.toFixed(2)} m`
                                  : "Unavailable"}

                              </p>

                              {gps.altitudeReference !== null && (
                                <p className="mt-1 text-xs text-base-content/50">
                                  Reference: {String(gps.altitudeReference)}
                                </p>
                              )}

                            </div>


                            <div className="rounded-xl bg-base-200 p-4">

                              <p className="text-xs text-base-content/50">
                                DIRECTION
                              </p>

                              <p className="mt-2 font-display text-lg font-bold">

                                {gps.direction !== null
                                  ? `${gps.direction.toFixed(1)}°`
                                  : "Unavailable"}

                              </p>

                            </div>

                          </div>


                          {/* Location lookup */}

                          <button
                            type="button"
                            onClick={handleLocationLookup}
                            disabled={locationLoading}
                            className="cipher-button cipher-button-primary mt-5 w-full disabled:opacity-50"
                          >

                            {locationLoading ? (
                              <span className="loading loading-spinner loading-sm" />
                            ) : (
                              <Navigation size={17} />
                            )}

                            {locationLoading
                              ? "Identifying location..."
                              : "Find city / area"}

                          </button>


                          {/* Map links */}

                          <div className="mt-4 flex flex-wrap gap-4">

                            <a
                              href={createMapUrl(
                                gps.latitude,
                                gps.longitude,
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                            >
                              OpenStreetMap
                              <ExternalLink size={13} />
                            </a>


                            <a
                              href={createGoogleMapsUrl(
                                gps.latitude,
                                gps.longitude,
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                            >
                              Google Maps
                              <ExternalLink size={13} />
                            </a>

                          </div>


                          {/* Location errors */}

                          {locationError && (

                            <div className="alert alert-warning mt-4 text-sm">
                              {locationError}
                            </div>

                          )}


                          {/* Resolved location */}

                          {location && (

                            <div className="mt-5 rounded-xl border border-success/30 bg-success/5 p-4">

                              <p className="text-xs font-bold uppercase tracking-wider text-success">
                                Reverse geocoding result
                              </p>

                              <h4 className="mt-3 font-display text-xl font-bold">
                                {location.city ||
                                  location.suburb ||
                                  "Location identified"}
                              </h4>

                              {location.suburb && (
                                <p className="mt-1 text-sm text-base-content/65">
                                  {location.suburb}
                                </p>
                              )}

                              <p className="mt-2 text-sm leading-6 text-base-content/65">
                                {location.address}
                              </p>

                              <p className="mt-3 text-[10px] text-base-content/45">
                                {location.attribution}
                              </p>

                            </div>

                          )}


                          <p className="mt-5 text-xs leading-6 text-base-content/50">
                            These coordinates represent the location
                            recorded in the image metadata. Reverse
                            geocoding identifies the nearest mapped
                            address, which may not be the exact
                            building or property.
                          </p>

                        </>

                      ) : (

                        <div className="py-9 text-center">

                          <MapPin
                            size={34}
                            className="mx-auto text-base-content/25"
                          />

                          <h4 className="mt-4 font-display text-lg font-bold">
                            No GPS coordinates found
                          </h4>

                          <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-base-content/50">
                            This image does not contain usable
                            GPS information. An internet connection
                            cannot recover coordinates that were
                            never recorded.
                          </p>

                        </div>

                      )}

                    </div>

                  </section>


                  {/* PNG metadata chunks */}

                  <MetadataTable
                    title="PNG metadata chunks (PNG files only)"
                    rows={report.metadata.map((item) => ({
                      label: item.type,
                      description: item.description,
                      value: `${item.length} bytes`,
                    }))}
                  />


                  {/* Text metadata */}

                  <MetadataTable
                    title="Text metadata"
                    rows={report.textMetadata.map((item) => ({
                      label: item.keyword,
                      description: item.type,
                      value:
                        item.text ??
                        (item.compressed
                          ? "Compressed text. Decoding not yet supported."
                          : "No text available"),
                    }))}
                  />


                  {/* Physical dimensions */}

                  <MetadataTable
                    title="Physical dimensions"
                    rows={
                      report.image.physicalDimensions
                        ? Object.entries(
                            report.image.physicalDimensions,
                          ).map(([label, value]) => ({
                            label,
                            value,
                          }))
                        : []
                    }
                  />

                </>

              )}

            </div>

          </div>


          {/* Footer note */}

          <p className="mt-9 text-center text-xs leading-6 text-base-content/45">

            Metadata is not guaranteed to be authentic or complete.
            Image editing software can modify or remove timestamps,
            camera information and geographical coordinates.

          </p>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default MetadataPage;
