import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getDocument, getDocumentHistory } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';

const ACTIVE_STATUSES = new Set(['UPLOADED', 'PROCESSING']);

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function formatReason(reason) {
  if (!reason) return null;
  return reason.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export default function DocumentDetailPage() {
  const { documentId } = useParams();
  const [doc, setDoc] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showSpinner) => {
    if (showSpinner) setLoading(true);
    try {
      const [docResponse, historyResponse] = await Promise.all([
        getDocument(documentId),
        getDocumentHistory(documentId),
      ]);
      setDoc(docResponse);
      setHistory(historyResponse);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    if (!doc || !ACTIVE_STATUSES.has(doc.status)) return undefined;
    const interval = setInterval(() => load(false), 3000);
    return () => clearInterval(interval);
  }, [doc, load]);

  return (
    <main className="page">
      <Link to="/" className="back-link">← All documents</Link>

      {loading && <div className="card detail-section">Loading…</div>}

      {!loading && error && (
        <div className="banner banner-error">Couldn't load this document: {error}</div>
      )}

      {!loading && doc && (
        <>
          <div className="page-header">
            <div className="page-header-row">
              <h1 className="page-title mono" style={{ fontFamily: 'var(--font-mono)', margin: 0 }}>{doc.documentId}</h1>
              <StatusBadge status={doc.status} />
            </div>
            <p className="page-subtitle">{doc.originalFilename}</p>
          </div>

          {doc.status === 'FAILED' && doc.validationErrors && (
            <div className="banner banner-error">
              This document failed validation. See details below.
            </div>
          )}
          {doc.status === 'FAILED' && !doc.validationErrors && doc.failureReason && (
            <div className="banner banner-error">
              Processing failed: {formatReason(doc.failureReason)}
            </div>
          )}

          <div className="detail-grid">
            <div>
              <div className="card detail-section">
                <h3>Document information</h3>
                <dl className="kv-grid">
                  <dt>Filename</dt><dd>{doc.originalFilename}</dd>
                  <dt>Type</dt><dd>{doc.documentType}</dd>
                  <dt>Uploaded</dt><dd>{formatDate(doc.createdAt)}</dd>
                  <dt>Last updated</dt><dd>{formatDate(doc.updatedAt)}</dd>
                  <dt>Retry count</dt><dd>{doc.retryCount}</dd>
                </dl>
              </div>

              {doc.validationErrors && (
                <div className="card detail-section">
                  <h3>Validation errors</h3>
                  <ul className="validation-list">
                    {doc.validationErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="card detail-section">
                <h3>Extracted information</h3>
                {doc.result ? (
                  <dl className="kv-grid">
                    <dt>Company name</dt><dd>{doc.result.companyName || '—'}</dd>
                    <dt>Registration no.</dt><dd className="mono">{doc.result.registrationNumber || '—'}</dd>
                    <dt>Address</dt><dd>{doc.result.address || '—'}</dd>
                    <dt>Annual revenue</dt>
                    <dd>{doc.result.annualRevenue != null ? Number(doc.result.annualRevenue).toLocaleString() : '—'}</dd>
                    <dt>Document date</dt><dd>{doc.result.documentDate || '—'}</dd>
                  </dl>
                ) : (
                  <p style={{ color: 'var(--slate)', margin: 0, fontSize: 13.5 }}>
                    {doc.status === 'PROCESSED' ? 'No data extracted.' : 'Not available yet — this document hasn\'t finished processing.'}
                  </p>
                )}
              </div>
            </div>

            <div className="card detail-section">
              <h3>Processing history</h3>
              {history && history.length > 0 ? (
                <ul className="timeline">
                  {history.map((entry, index) => (
                    <li className="timeline-item" key={index}>
                      <span className={`timeline-dot status-${entry.status.toLowerCase()}`} style={{ background: 'currentColor' }} />
                      <div className={`status-${entry.status.toLowerCase()}`}>
                        <div className="timeline-time">{formatDate(entry.timestamp)}</div>
                        <div className="timeline-title">{entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}</div>
                      </div>
                      {entry.reason && <div className="timeline-detail">{formatReason(entry.reason)}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--slate)', margin: 0, fontSize: 13.5 }}>No history yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
