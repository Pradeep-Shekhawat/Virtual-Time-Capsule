import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CapsuleForm from './components/CapsuleForm';
import CapsuleGallery from './components/CapsuleGallery';
import CapsuleOpen from './components/CapsuleOpen';
import './App.css';

function App() {
  // Function to refresh the gallery after creating a new capsule
  const refreshGallery = () => {
    const event = new CustomEvent('capsuleCreated');
    window.dispatchEvent(event);
  };

  return (
    <Router>
      <div className="container">
        <header>
          <div className="logo">Virtual Time Capsule</div>
          <p className="tagline">Preserve your memories for the future</p>
          <nav>
            <Link to="/">Home</Link> | <Link to="/open">Open Capsule</Link>
          </nav>
        </header>

        <main className="main">
          <Routes>
            {/* Home route: create + gallery */}
            <Route
              path="/"
              element={
                <>
                  <div className="capsule-form">
                    <h2 className="section-title">Create Your Time Capsule</h2>
                    <CapsuleForm refreshGallery={refreshGallery} />
                  </div>
                  <div className="gallery">
                    <CapsuleGallery />
                  </div>
                </>
              }
            />
            {/* Open capsule route */}
            <Route path="/open" element={<CapsuleOpen />} />
          </Routes>
        </main>

        <footer>
          <p>© {new Date().getFullYear()} Virtual Time Capsule</p>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;