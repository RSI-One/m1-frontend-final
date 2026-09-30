import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode is removed intentionally.
// The dashboard uses vanilla JS with imperative DOM manipulation
// that doesn't work well with StrictMode's double-render in development.
createRoot(document.getElementById('root')!).render(<App />)
