import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadDocument } from '../api/client.js';
import { useToast } from '../components/ToastProvider.jsx';

const DOCUMENT_TYPES = [
  { value: 'FINANCIAL_STATEMENT', label: 'Financial statement' },
  { value: 'REGISTRATION_CERTIFICATE', label: 'Registration certificate' },
  { value: 'TAX_RETURN', label: 'Tax return' },
  { value: 'IDENTITY_PROOF', label: 'Identity proof' },
  { value: 'OTHER', label: 'Other' },
];

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('FINANCIAL_STATEMENT');
  const [customType, setCustomType] = useState('');
  const [metadata, setMetadata] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const showToast = useToast();

  const effectiveType = documentType === 'OTHER' ? customType.trim() : documentType;

  function handleFiles(fileList) {
    if (fileList && fileList.length > 0) {
      setFile(fileList[0]);
      setResult(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || !effectiveType) {
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const response = await uploadDocument(file, effectiveType, metadata.trim() || undefined);
      setResult({ ok: true, data: response });
      showToast(
        response.duplicate
          ? `Already have this file — showing ${response.documentId}`
          : `Uploaded as ${response.documentId}`,
        'success'
      );
      setFile(null);
      setMetadata('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      setResult({ ok: false, message: error.message });
      showToast('Upload failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page upload-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload a document</h1>
          <p className="page-subtitle">Files are processed asynchronously — you'll see the status update on the documents page.</p>
        </div>
      </div>

      {result?.ok && (
        <div className="banner banner-success">
          {result.data.duplicate ? 'This file was already uploaded. ' : 'Upload received. '}
          <Link to={`/documents/${result.data.documentId}`}>View {result.data.documentId} →</Link>
        </div>
      )}
      {result && !result.ok && (
        <div className="banner banner-error">Couldn't upload this file: {result.message}</div>
      )}

      <form className="card upload-card" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="file-input">Document</label>
          <div
            className={`dropzone${dragActive ? ' drag-active' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFiles(event.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <div>
              <strong>Click to choose a file</strong> or drag it here
            </div>
            <input
              id="file-input"
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(event) => handleFiles(event.target.files)}
            />
            {file && (
              <div className="file-chip">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </div>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="doc-type">Document type</label>
          <select id="doc-type" className="select" value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {documentType === 'OTHER' && (
            <input
              className="text-input"
              style={{ marginTop: 8, width: '100%' }}
              placeholder="Enter a document type"
              value={customType}
              onChange={(event) => setCustomType(event.target.value)}
            />
          )}
        </div>

        <div className="field">
          <label htmlFor="metadata">Metadata <span className="hint" style={{ fontWeight: 400 }}>(optional)</span></label>
          <textarea
            id="metadata"
            className="textarea"
            style={{ width: '100%', minHeight: 70, resize: 'vertical' }}
            placeholder="Notes, source system reference, or any context for this document"
            value={metadata}
            onChange={(event) => setMetadata(event.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting || !file || !effectiveType}>
          {submitting && <span className="spinner" />}
          {submitting ? 'Uploading…' : 'Upload document'}
        </button>
      </form>
    </main>
  );
}
