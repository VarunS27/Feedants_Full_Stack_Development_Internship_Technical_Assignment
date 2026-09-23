import { Platform } from 'react-native';
import { apiClient } from './client';

/**
 * Sends the picked file as multipart form data.
 *
 * The two platforms need genuinely different payloads and there is no shared shape:
 * React Native's FormData understands a `{ uri, name, type }` descriptor and streams
 * the file from disk itself, while the browser requires a real Blob/File — handed the
 * descriptor it stringifies it to "[object Object]" and the server receives no file
 * at all (HTTP 400 FILE_REQUIRED).
 */
const buildFormData = async ({ uri, name, mimeType, file }) => {
  const form = new FormData();
  const filename = name || 'submission';

  if (Platform.OS === 'web') {
    // The picker hands back a File on web; fall back to re-reading the blob: URI.
    const blob = file ?? (await fetch(uri).then((res) => res.blob()));
    form.append('file', blob, filename);
  } else {
    form.append('file', { uri, name: filename, type: mimeType || 'application/octet-stream' });
  }

  return form;
};

export const uploadFile = async (asset) => {
  const form = await buildFormData(asset);

  return apiClient.post('/uploads', form, {
    // Do NOT set Content-Type here — let axios/RN set it with the multipart boundary.
    headers: { 'Content-Type': undefined },
    transformRequest: (data) => data,
    timeout: 120000,
  });
};
