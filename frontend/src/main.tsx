import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider } from './context/ContentContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)
