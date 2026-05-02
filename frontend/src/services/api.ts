export async function uploadDocument(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('document', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Upload failed.');
  }

  return data.text as string;
}
