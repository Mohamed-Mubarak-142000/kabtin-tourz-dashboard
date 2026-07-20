import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { ConfirmationProvider } from './contexts/ConfirmationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NextUIProvider>
        <ThemeProvider>
          <AuthProvider>
            <ConfirmationProvider>
              <App />
            </ConfirmationProvider>
          </AuthProvider>
        </ThemeProvider>
      </NextUIProvider>
    </BrowserRouter>
  </React.StrictMode>
)
