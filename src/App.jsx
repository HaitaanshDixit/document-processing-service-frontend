import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';
import DocumentsListPage from './pages/DocumentsListPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import DocumentDetailPage from './pages/DocumentDetailPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DocumentsListPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/documents/:documentId" element={<DocumentDetailPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
