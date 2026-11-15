
const NOMINATIM_ENDPOINT =
  "https://nominatim.openstreetmap.org/reverse";

export async function lookupPhotoLocation(latitude, longitude) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid GPS coordinates.");
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  });

  const response = await fetch(
    `${NOMINATIM_ENDPOINT}?${params}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Location lookup failed.");
  }

  const data = await response.json();

  return {
    address: data.display_name,
    city:
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      null,
    suburb:
      data.address?.suburb ||
      data.address?.neighbourhood ||
      null,
    state: data.address?.state || null,
    country: data.address?.country || null,
    attribution: "© OpenStreetMap contributors",
  };
}

export function createMapUrl(latitude, longitude) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;
}

export function createGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
