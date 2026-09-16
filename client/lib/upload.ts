import api from './api';

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

  const res = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.data.url;
}
