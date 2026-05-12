import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api';

const ACCEPTED = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp';

interface Props {
  onUpload: (text: string, file: File) => void;
}

export default function DocumentUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
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
      <div className="text-center mb-4 py-3">
        <h1
          className="mb-1 fw-bold"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.4rem',
            letterSpacing: '-0.5px',
          }}
        >
          Question Generator
        </h1>
        <p className="text-muted small mb-0">Upload a document and generate a question paper instantly</p>
      </div>

      <div
        className="border rounded p-5 text-center"
        style={{
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderWidth: '2px',
          borderColor: dragging ? '#6f42c1' : hovering ? '#0d6efd' : '#adb5bd',
          background: dragging
            ? 'linear-gradient(135deg, #e0cffc 0%, #cfe2ff 100%)'
            : hovering
            ? 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)'
            : 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
          transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          boxShadow: hovering || dragging ? '0 4px 20px rgba(99,102,241,0.15)' : 'none',
        }}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
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
            <p className="text-muted small mb-0 mt-1">Supports typed, scanned, and handwritten documents</p>
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
