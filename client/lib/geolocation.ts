export interface DetectedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  displayName?: string;
}

export async function detectCurrentPosition(): Promise<DetectedLocation> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            resolve({
              latitude,
              longitude,
              accuracy,
              road: data.road || '',
              suburb: data.suburb || '',
              city: data.city || '',
              state: data.state || '',
              pincode: data.pincode || '',
              landmark: data.landmark || '',
              displayName: data.displayName || '',
            });
            return;
          }
        } catch {
          // If geocoding lookup fails, fallback gracefully to returning coordinates
        }

        resolve({
          latitude,
          longitude,
          accuracy,
        });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error('Location access was denied. Please allow location access in your browser settings.'));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error('Location information is currently unavailable. Please enter details manually.'));
            break;
          case err.TIMEOUT:
            reject(new Error('Location request timed out. Please try again or fill manually.'));
            break;
          default:
            reject(new Error('Unable to retrieve current location.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}
