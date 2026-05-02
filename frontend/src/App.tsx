import { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentPreview from './components/DocumentPreview';

function App() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleUpload(text: string, uploadedFile: File) {
    setExtractedText(text);
    setFile(uploadedFile);
  }

  function handleReplace() {
    setExtractedText(null);
    setFile(null);
  }

  if (!extractedText || !file) {
    return <DocumentUpload onUpload={handleUpload} />;
  }

  // Subsequent features (configure, generate, edit, export) mount here
  return <DocumentPreview file={file} text={extractedText} onReplace={handleReplace} />;
}

export default App;
