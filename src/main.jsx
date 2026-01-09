import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/TiptapEditor.css'
import App from './App.jsx'
import AcademicArticleSetup from "./pages/AcademicArticleSetup";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/academic-article-setup" element={<AcademicArticleSetup />} />
      </Routes>
    </Router>
  </StrictMode>,
)
