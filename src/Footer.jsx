import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>©AIUB English Club</p>
      <p>This app was developed by Mahir Mahmud Siam</p>
      <div className="social-icons">
        <a href="https://github.com/MahirMsiam" target="_blank" rel="noopener noreferrer">
          <img src="/src/icons/github.png" alt="GitHub" />
        </a>
        <a href="https://www.linkedin.com/in/mahir-mahmud-siam" target="_blank" rel="noopener noreferrer">
          <img src="/src/icons/linkedin.png" alt="LinkedIn" />
        </a>
        <a href="https://www.facebook.com/mahirmahmudsiam" target="_blank" rel="noopener noreferrer">
          <img src="/src/icons/facebook.png" alt="Facebook" />
        </a>
        <a href="https://www.instagram.com/bhallagtase_na" target="_blank" rel="noopener noreferrer">
          <img src="/src/icons/instagram.png" alt="Instagram" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
