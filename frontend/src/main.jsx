// frontend/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={12}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          icon: 'Success',
        },
        error: {
          icon: 'Error',
        },
      }}
    />
  </StrictMode>
)