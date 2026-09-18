import { API_URL } from './api';

/**
 * Uploads an image file to Neon S3 (or fallback storage) via the /api/v1/upload endpoint.
 * @param file Browser File object from input[type=file]
 * @param folder Target folder prefix in S3 (e.g. 'products', 'banners', 'categories')
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(file: File, folder = 'uploads'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Use standard browser fetch so the runtime automatically sets 'multipart/form-data; boundary=...'
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const errorMsg = json?.error || json?.message || `Upload failed (status ${res.status})`;
    throw new Error(errorMsg);
  }

  return json.data.url;
}
