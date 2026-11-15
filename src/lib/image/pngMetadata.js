import exifr from "exifr";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const decoder = new TextDecoder();

function readUint32(bytes, offset) {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint32(offset, false);
}

function readNullTerminated(bytes, start) {
  let end = start;

  while (end < bytes.length && bytes[end] !== 0) {
    end++;
  }

  return {
    value: decoder.decode(bytes.subarray(start, end)),
    next: end + 1,
  };
}

function parseTextChunk(type, data) {
  if (type === "tEXt") {
    const keyword = readNullTerminated(data, 0);
    return {
      keyword: keyword.value,
      text: decoder.decode(data.subarray(keyword.next)),
    };
  }

  if (type === "zTXt") {
    const keyword = readNullTerminated(data, 0);

    return {
      keyword: keyword.value,
      compression: data[keyword.next],
      compressed: true,
      text: null,
    };
  }

  if (type === "iTXt") {
    const keyword = readNullTerminated(data, 0);
    let offset = keyword.next;

    const compressionFlag = data[offset++];
    const compressionMethod = data[offset++];

    const language = readNullTerminated(data, offset);
    offset = language.next;

    const translated = readNullTerminated(data, offset);
    offset = translated.next;

    const textBytes = data.subarray(offset);

    return {
      keyword: keyword.value,
      language: language.value,
      translatedKeyword: translated.value,
      compressionFlag,
      compressionMethod,
      compressed: compressionFlag === 1,
      text: compressionFlag === 0 ? decoder.decode(textBytes) : null,
    };
  }

  return null;
}

function parsePhys(data) {
  if (data.length !== 9) return null;

  return {
    pixelsPerUnitX: readUint32(data, 0),
    pixelsPerUnitY: readUint32(data, 4),
    unit: data[8] === 1 ? "metres" : "unknown",
  };
}

function parseIHDR(data) {
  if (data.length !== 13) {
    throw new Error("Invalid PNG IHDR chunk.");
  }

  const colourTypes = {
    0: "Grayscale",
    2: "Truecolor RGB",
    3: "Indexed colour",
    4: "Grayscale with alpha",
    6: "Truecolor RGBA",
  };

  const bitDepth = data[8];
  const colourType = data[9];

  return {
    width: readUint32(data, 0),
    height: readUint32(data, 4),
    bitDepth,
    colourType,
    colourTypeName: colourTypes[colourType] || "Unknown",
    compressionMethod: data[10],
    filterMethod: data[11],
    interlaceMethod: data[12] === 1 ? "Adam7" : "None",
  };
}

export async function inspectPNG(file) {
  if (!file || file.type !== "image/png") {
    throw new Error("Please select a PNG image.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (
    bytes.length < 33 ||
    !PNG_SIGNATURE.every((value, index) => bytes[index] === value)
  ) {
    throw new Error("Invalid PNG signature.");
  }

  const chunks = [];
  const textMetadata = [];

  let offset = 8;
  let imageInfo = null;
  let ended = false;

  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new Error("PNG contains a truncated chunk.");
    }

    const length = readUint32(bytes, offset);

    if (length > bytes.length - offset - 12) {
      throw new Error("PNG contains an invalid chunk length.");
    }

    const type = decoder.decode(bytes.subarray(offset + 4, offset + 8));

    const dataStart = offset + 8;
    const dataEnd = dataStart + length;

    const data = bytes.subarray(dataStart, dataEnd);
    const crc = readUint32(bytes, dataEnd);

    const chunk = {
      type,
      length,
      offset,
      crc: `0x${crc.toString(16).padStart(8, "0")}`,
      ancillary: (type.charCodeAt(0) & 32) !== 0,
    };

    chunks.push(chunk);

    if (type === "IHDR") {
      if (imageInfo || offset !== 8) {
        throw new Error("Invalid PNG header placement.");
      }

      imageInfo = parseIHDR(data);
    }

    if (["tEXt", "zTXt", "iTXt"].includes(type)) {
      const parsed = parseTextChunk(type, data);

      if (parsed) {
        textMetadata.push({
          type,
          ...parsed,
        });
      }
    }

    if (type === "pHYs") {
      imageInfo.physicalDimensions = parsePhys(data);
    }

    if (type === "IEND") {
      if (length !== 0) {
        throw new Error("Invalid PNG IEND chunk.");
      }

      ended = true;
      offset = dataEnd + 4;
      break;
    }

    offset = dataEnd + 4;
  }

  if (!imageInfo || !chunks.some((chunk) => chunk.type === "IDAT")) {
    throw new Error("PNG is missing required image chunks.");
  }

  if (!ended) {
    throw new Error("PNG is missing its IEND chunk.");
  }

  const metadataChunks = chunks.filter((chunk) => chunk.ancillary);

  const metadataTypes = {
    eXIf: "EXIF information",
    tEXt: "Text metadata",
    zTXt: "Compressed text metadata",
    iTXt: "International text metadata",
    pHYs: "Physical dimensions",
    tIME: "Modification time",
    iCCP: "Embedded colour profile",
    gAMA: "Gamma information",
    cHRM: "Chromaticity information",
    sRGB: "Standard RGB colour space",
  };

  const metadata = metadataChunks.map((chunk) => ({
    ...chunk,
    description: metadataTypes[chunk.type] || "Ancillary PNG information",
  }));

  let exif = {};

  try {
    exif = (await exifr.parse(file, true)) || {};
  } catch (error) {
    console.warn("EXIF metadata could not be parsed:", error);
  }

  const getDate = (value) => {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const captureDate = getDate(exif.DateTimeOriginal);
  const digitizedDate = getDate(exif.DateTimeDigitized);
  const modifiedDate = getDate(exif.ModifyDate);

  const gps = {
    latitude: Number.isFinite(exif.latitude) ? exif.latitude : null,

    longitude: Number.isFinite(exif.longitude) ? exif.longitude : null,

    altitude: Number.isFinite(exif.GPSAltitude) ? exif.GPSAltitude : null,

    altitudeReference: exif.GPSAltitudeRef ?? null,

    direction: Number.isFinite(exif.GPSImgDirection)
      ? exif.GPSImgDirection
      : null,
  };

  const dates = {
  captured: captureDate,
  digitized: digitizedDate,
  created: getDate(exif.CreateDate || exif.DateCreated),
  modified: modifiedDate,
  metadataModified: getDate(exif.MetadataDate),
  gpsDate: exif.GPSDateStamp ?? null,
  gpsTime: exif.GPSTimeStamp ?? null,
  originalOffset: exif.OffsetTimeOriginal ?? null,
  modifiedOffset: exif.OffsetTime ?? null,
};

  const camera = {
    make: exif.Make ?? null,
    model: exif.Model ?? null,
    lens: exif.LensModel ?? null,
    software: exif.Software ?? null,
    artist: exif.Artist ?? null,
    copyright: exif.Copyright ?? null,
    description: exif.ImageDescription ?? null,
    orientation: exif.Orientation ?? null,
    iso: exif.ISO ?? null,
    aperture: exif.FNumber ?? null,
    exposure: exif.ExposureTime ?? null,
    focalLength: exif.FocalLength ?? null,
  };

  return {
    exif: {
      dates,
      gps,
      camera,
    },
    file: {
      name: file.name,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2),
      type: file.type,
      lastModified: file.lastModified,
    },
    image: {
      ...imageInfo,
      megapixels: ((imageInfo.width * imageInfo.height) / 1_000_000).toFixed(2),
    },
    chunks,
    metadata,
    textMetadata,
    summary: {
      totalChunks: chunks.length,
      metadataChunks: metadata.length,
      textEntries: textMetadata.length,
      hasExif: chunks.some((chunk) => chunk.type === "eXIf"),
      hasColorProfile: chunks.some((chunk) => chunk.type === "iCCP"),
      hasCipherSignature: false,
    },
  };
}


/**
 * Format-aware metadata inspection. PNG retains its chunk-level report;
 * other browser-readable formats use EXIF parsing and native image dimensions.
 * Unsupported metadata containers are reported as unavailable, not guessed.
 */
export async function inspectImage(file) {
  if (!file) throw new Error("Select an image first.");
  if (file.type === "image/png" || /\.png$/i.test(file.name || "")) {
    return inspectPNG(file);
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "This browser cannot decode the selected format for inspection. Try a browser with support for this camera format; the file has not been converted."
    );
  }

  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close?.();

  let exif = {};
  let metadataRead = true;
  try {
    exif = (await exifr.parse(file, true)) || {};
  } catch {
    metadataRead = false;
  }

  const asDate = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const gps = {
    latitude: Number.isFinite(exif.latitude) ? exif.latitude : null,
    longitude: Number.isFinite(exif.longitude) ? exif.longitude : null,
    altitude: Number.isFinite(exif.GPSAltitude) ? exif.GPSAltitude : null,
    altitudeReference: exif.GPSAltitudeRef ?? null,
    direction: Number.isFinite(exif.GPSImgDirection) ? exif.GPSImgDirection : null,
  };

  const camera = {
    make: exif.Make ?? null,
    model: exif.Model ?? null,
    lens: exif.LensModel ?? null,
    software: exif.Software ?? null,
    artist: exif.Artist ?? null,
    copyright: exif.Copyright ?? null,
    description: exif.ImageDescription ?? null,
    orientation: exif.Orientation ?? null,
    iso: exif.ISO ?? null,
    aperture: exif.FNumber ?? null,
    exposure: exif.ExposureTime ?? null,
    focalLength: exif.FocalLength ?? null,
  };

  return {
    exif: {
      dates: {
        captured: asDate(exif.DateTimeOriginal),
        digitized: asDate(exif.DateTimeDigitized),
        created: asDate(exif.CreateDate || exif.DateCreated),
        modified: asDate(exif.ModifyDate),
        metadataModified: asDate(exif.MetadataDate),
        gpsDate: exif.GPSDateStamp ?? null,
        gpsTime: exif.GPSTimeStamp ?? null,
        originalOffset: exif.OffsetTimeOriginal ?? null,
        modifiedOffset: exif.OffsetTime ?? null,
      },
      gps,
      camera,
    },
    file: {
      name: file.name,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2),
      type: file.type || "Unknown image format",
      lastModified: file.lastModified,
    },
    image: {
      width,
      height,
      megapixels: ((width * height) / 1_000_000).toFixed(2),
      bitDepth: "Not exposed by browser decoder",
      colourTypeName: "Not exposed by browser decoder",
      interlaceMethod: "Not applicable / unavailable",
      compressionMethod: "Format-dependent",
      filterMethod: "Not applicable",
    },
    chunks: [],
    metadata: [],
    textMetadata: [],
    summary: {
      totalChunks: 0,
      metadataChunks: 0,
      textEntries: 0,
      hasExif: Object.keys(exif).length > 0,
      hasColorProfile: false,
      hasCipherSignature: false,
      metadataRead,
      formatSpecificDetails: "Container-level chunk details are only available for PNG in this version.",
    },
  };
}
