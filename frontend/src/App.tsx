import { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import DocumentPreview from './components/DocumentPreview';
import ConfigPanel from './components/ConfigPanel';
import QuestionPaperView from './components/QuestionPaperView';
import { generatePaper } from './services/api';
import type { PaperConfig, QuestionPaper } from './types';

type Stage = 'configure' | 'generating' | 'done';

function App() {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>('configure');
  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleUpload(text: string, uploadedFile: File) {
    setExtractedText(text);
    setFile(uploadedFile);
    setStage('configure');
    setPaper(null);
    setError(null);
  }

  function handleReplace() {
    setExtractedText(null);
    setFile(null);
    setStage('configure');
    setPaper(null);
    setError(null);
  }

  async function handleGenerate(config: PaperConfig) {
    if (!extractedText) return;
    setStage('generating');
    setError(null);
    try {
      const result = await generatePaper(extractedText, config);
      setPaper(result);
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
      setStage('configure');
    }
  }

  function handleReset() {
    setPaper(null);
    setStage('configure');
    setError(null);
  }

  if (!extractedText || !file) {
    return <DocumentUpload onUpload={handleUpload} />;
  }

  return (
    <div className="container-fluid py-4 px-4">
      <h1 className="mb-4 text-center">QP Maker</h1>

      {stage === 'done' && paper ? (
        <div className="row justify-content-center">
          <div className="col-xl-9">
            <div className="card">
              <div className="card-body p-4">
                <QuestionPaperView paper={paper} onReset={handleReset} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <DocumentPreview file={file} text={extractedText} onReplace={handleReplace} />
          </div>
          <div className="col-lg-4">
            {error && (
              <div className="alert alert-danger mb-3" role="alert">{error}</div>
            )}
            <ConfigPanel onGenerate={handleGenerate} loading={stage === 'generating'} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
