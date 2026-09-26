const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8092';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message = body && body.message ? body.message : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, body);
  }

  return body;
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function uploadDocument(file, documentType, metadata) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (metadata) {
    formData.append('metadata', metadata);
  }
  return request('/documents', { method: 'POST', body: formData });
}

export function getDocument(documentId) {
  return request(`/documents/${encodeURIComponent(documentId)}`);
}

export function getDocumentHistory(documentId) {
  return request(`/documents/${encodeURIComponent(documentId)}/history`);
}

export function listDocuments({ status, documentType, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (documentType) params.set('documentType', documentType);
  params.set('page', String(page));
  params.set('size', String(size));
  return request(`/documents?${params.toString()}`);
}

export function getStats() {
  return request('/documents/stats');
}
