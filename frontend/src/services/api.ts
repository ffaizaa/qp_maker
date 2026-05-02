import type { PaperConfig, QuestionPaper } from '../types';

export async function generatePaper(text: string, config: PaperConfig): Promise<QuestionPaper> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, config }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Generation failed.');
  }

  return data as QuestionPaper;
}

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
