import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import App from './App';
import { AdminPanel } from './components/admin/AdminPanel';
import './index.css';

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ContentProvider><App /></ContentProvider>} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Root;
