import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';import './index.css'
import App from './App.tsx'
import History from './History.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
          <nav>
              <Link to="/">Forecast</Link>
              <Link to="/history">History</Link>
          </nav>
          <Routes>
              <Route path="/" element={<App />}/>
              <Route path="/history" element={<History />}/>
          </Routes>
      </BrowserRouter>
    </StrictMode>
)
