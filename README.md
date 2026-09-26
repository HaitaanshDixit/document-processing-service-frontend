# Document Processing Service (Frontend)

React + Vite UI for the SuretySeven document processing backend.

## Pages

- **Documents** (`/`) : status summary strip, filterable/paginated table, auto-refreshes every 5s.
- **Upload** (`/upload`) : drag-and-drop upload with document type and optional metadata.
- **Document detail** (`/documents/:id`) : document info, extracted fields, validation errors (if any), and a processing history timeline. Auto-refreshes every 3s while the document is still `UPLOADED`/`PROCESSING`.