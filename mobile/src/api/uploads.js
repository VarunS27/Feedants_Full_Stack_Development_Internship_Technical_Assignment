import { apiClient } from './client';

/**
 * Sends the picked file as multipart form data. The Content-Type header is deleted so
 * the runtime sets it along with the multipart boundary, which it cannot do if a
 * default JSON content type is already present.
 */
export const uploadFile = ({ uri, name, mimeType }) => {
  const form = new FormData();
  form.append('file', { uri, name: name || 'submission', type: mimeType || 'video/mp4' });

  return apiClient.post('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
    timeout: 120000,
  });
};
