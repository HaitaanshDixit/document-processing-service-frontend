import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDocuments, getStats } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';

const STATUS_OPTIONS = ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'];
const TYPE_OPTIONS = ['FINANCIAL_STATEMENT', 'REGISTRATION_CERTIFICATE', 'TAX_RETURN', 'IDENTITY_PROOF'];
const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function DocumentsListPage() {
  const [status, setStatus] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async (showSpinner) => {
    if (showSpinner) setLoading(true);
    try {
      const [docs, statsResponse] = await Promise.all([
        listDocuments({ status: status || undefined, documentType: documentType || undefined, page, size: PAGE_SIZE }),
        getStats(),
      ]);
      setData(docs);
      setStats(statsResponse);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [status, documentType, page]);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(false), 5000);
    return () => clearInterval(interval);
  }, [load]);

  const hasFilters = Boolean(status || documentType);

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(0);
  }

  function handleTypeChange(event) {
    setDocumentType(event.target.value);
    setPage(0);
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Uploaded documents and their processing status.</p>
        </div>
      </div>

      {stats && (
        <div className="stat-strip">
          <StatCell label="Total" value={stats.total} />
          <StatCell label="Uploaded" value={stats.uploaded} />
          <StatCell label="Processing" value={stats.processing} />
          <StatCell label="Processed" value={stats.processed} />
          <StatCell label="Failed" value={stats.failed} />
        </div>
      )}

      <div className="filter-bar">
        <select className="select" value={status} onChange={handleStatusChange}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option.charAt(0) + option.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <select className="select" value={documentType} onChange={handleTypeChange}>
          <option value="">All types</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option.replaceAll('_', ' ').toLowerCase()}</option>
          ))}
        </select>
      </div>

      {error && <div className="banner banner-error">Couldn't load documents: {error}</div>}

      {loading && (
        <div className="doc-table">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="skeleton-row" key={index} />
          ))}
        </div>
      )}

      {!loading && data && data.content.length === 0 && (
        <div className="card empty-state">
          <h3>{hasFilters ? 'No documents match these filters' : 'No documents yet'}</h3>
          <p>{hasFilters ? 'Try clearing a filter to see more results.' : 'Upload a document to see it show up here.'}</p>
        </div>
      )}

      {!loading && data && data.content.length > 0 && (
        <>
          <div className="doc-table">
            <table>
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Filename</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((doc) => (
                  <tr key={doc.documentId} onClick={() => navigate(`/documents/${doc.documentId}`)}>
                    <td className="mono">{doc.documentId}</td>
                    <td>{doc.filename}</td>
                    <td>{doc.documentType}</td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td>{formatDate(doc.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: data.totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`page-btn${index === page ? ' active' : ''}`}
                  onClick={() => setPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button className="page-btn" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="stat-cell">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
