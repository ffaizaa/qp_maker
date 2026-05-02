import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api';

const ACCEPTED = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp';

interface Props {
  onUpload: (text: string, file: File) => void;
}

export default function DocumentUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const text = await uploadDocument(file);
      onUpload(text, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">QP Maker</h1>

      <div
        className={`border rounded p-5 text-center ${dragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
        style={{ cursor: 'pointer', borderStyle: 'dashed' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="d-none"
          onChange={onInputChange}
        />

        {loading ? (
          <>
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="mb-0 text-muted">Extracting text…</p>
          </>
        ) : (
          <>
            <p className="fs-5 mb-1">Drop your document here, or click to browse</p>
            <p className="text-muted small mb-0">PDF, DOCX, TXT, JPG, PNG, WEBP — up to 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
