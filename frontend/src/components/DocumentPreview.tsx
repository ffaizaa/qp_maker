import { useEffect, useMemo, useState } from 'react';
import mammoth from 'mammoth';

interface Props {
  file: File;
  text: string;
  onReplace: () => void;
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export default function DocumentPreview({ file, text, onReplace }: Props) {
  // Blob URL for PDF / image — created once per file, revoked on cleanup
  const blobUrl = useMemo(() => {
    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  // DOCX → HTML via mammoth (async, so setState in callback is fine)
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

  useEffect(() => {
    if (file.type !== DOCX_MIME) return;
    let cancelled = false;
    file.arrayBuffer()
      .then((buf) => mammoth.convertToHtml({ arrayBuffer: buf }))
      .then((result) => { if (!cancelled) setDocxHtml(result.value); });
    return () => { cancelled = true; setDocxHtml(null); };
  }, [file]);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  function renderBody() {
    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={blobUrl!}
          title={file.name}
          style={{ width: '100%', height: '70vh', border: 'none' }}
        />
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <div className="p-3 text-center bg-light">
          <img
            src={blobUrl!}
            alt={file.name}
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </div>
      );
    }

    if (file.type === DOCX_MIME) {
      if (!docxHtml) {
        return (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Rendering document…
          </div>
        );
      }
      return (
        <div
          className="p-4"
          style={{ maxHeight: '70vh', overflowY: 'auto', fontFamily: 'serif', lineHeight: '1.7' }}
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      );
    }

    // Plain text (TXT)
    return (
      <pre
        className="m-0 p-4"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {text}
      </pre>
    );
  }

  return (
    <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 text-truncate">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-text flex-shrink-0" viewBox="0 0 16 16">
              <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z"/>
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1"/>
            </svg>
            <span className="fw-semibold text-truncate" title={file.name}>{file.name}</span>
          </div>
          <div className="d-flex align-items-center gap-3 flex-shrink-0">
            <span className="text-muted small">
              {wordCount.toLocaleString()} words &middot; {text.length.toLocaleString()} chars
            </span>
            <button className="btn btn-sm btn-outline-secondary" onClick={onReplace}>
              Replace
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          {renderBody()}
        </div>
      </div>
  );
}
