import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon parameters are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DevVegisApp/1.0 (contact@devvegis.com)',
          'Accept-Language': 'en',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to reverse geocode coordinates' }, { status: 502 });
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.pedestrian || addr.street || '';
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || '';
    const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || '';
    const state = addr.state || '';
    const rawPincode = addr.postcode ? String(addr.postcode).replace(/\D/g, '') : '';
    const pincode = rawPincode.length >= 6 ? rawPincode.slice(0, 6) : rawPincode;
    const landmark = addr.amenity || addr.building || addr.commercial || '';

    return NextResponse.json({
      success: true,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      road,
      suburb,
      city,
      state,
      pincode,
      landmark,
      displayName: data.display_name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Reverse geocode service unavailable' }, { status: 500 });
  }
}
