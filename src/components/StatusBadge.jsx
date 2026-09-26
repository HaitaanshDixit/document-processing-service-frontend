const LABELS = {
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  FAILED: 'Failed',
};

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase();
  const label = LABELS[status] || status;

  return (
    <span className={`status-badge status-${key}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}
