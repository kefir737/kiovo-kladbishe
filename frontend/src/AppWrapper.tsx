import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import App from './App';
import { AdminPanel } from './components/admin/AdminPanel';
import './index.css';

function Main() {
  return (
    <ContentProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </ContentProvider>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  );
}

export default Root;
