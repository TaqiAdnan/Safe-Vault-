import { Link } from "react-router-dom";
import "../styles/style.css";

export default function MainFooter() {
  const socialLinks = [
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com' },
    { name: 'Facebook', icon: '👍', url: 'https://facebook.com' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com' },
    { name: 'Twitter', icon: '𝕏', url: 'https://twitter.com' },
  ];

  return (
    <footer className="main-footer py-5">
      <div className="container">
        <div className="row g-5">

          {/* QUICK LINKS */}
          <div className="col-12 col-md-4">
            <h6 className="footer-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              🔗 QUICK LINKS
            </h6>
            <div className="d-flex flex-column gap-3">
              <Link className="footer-link" to="/about">ABOUT US</Link>
              <Link className="footer-link" to="/help">HELP CENTER</Link>
              <Link className="footer-link" to="/contact">CONTACT US</Link>
              <Link className="footer-link" to="/terms">TERMS & CONDITIONS</Link>
              <Link className="footer-link" to="/privacy">PRIVACY POLICY</Link>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="col-12 col-md-4">
            <h6 className="footer-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              📍 ADDRESS
            </h6>
            <div className="footer-address">
              <p style={{ marginBottom: '0.5rem', color: '#d6d6d6' }}>
                <strong>Birzeit University</strong>
              </p>
              <p style={{ marginBottom: '0.5rem', color: '#d6d6d6' }}>
                Ramallah, Palestine
              </p>
              <p style={{ marginBottom: '0.5rem', color: '#bdbdbd' }}>
                PO Box 00102
              </p>
              <p style={{ marginBottom: '0', color: '#bdbdbd', fontSize: '0.95rem' }}>
                <a href="mailto:support@safevault.com" style={{ color: '#ffa500', textDecoration: 'none' }} title="Email us">
                  📧 support@safevault.com
                </a>
              </p>
              <p style={{ marginTop: '0.5rem', color: '#bdbdbd', fontSize: '0.95rem' }}>
                <a href="tel:+97022982121" style={{ color: '#ffa500', textDecoration: 'none' }} title="Call us">
                  📞 +970 (2) 298-2121
                </a>
              </p>
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="col-12 col-md-4">
            <h6 className="footer-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              🌐 FOLLOW US
            </h6>
            <div className="social-links">
              <div className="d-flex gap-3 flex-wrap">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    title={social.name}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: '#1a1a1a',
                      color: '#ffa500',
                      fontSize: '1.5rem',
                      textDecoration: 'none',
                      border: '2px solid #ffa500',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffa500';
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                      e.currentTarget.style.color = '#ffa500';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p style={{ marginTop: '1rem', color: '#bdbdbd', fontSize: '0.9rem' }}>
                Connect with us on social media for updates and news.
              </p>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          color: '#bdbdbd',
          fontSize: '0.9rem'
        }}>
          <div>
            © {new Date().getFullYear()} SafeVault Directory. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/privacy" style={{ color: '#f6a300', textDecoration: 'none' }} className="footer-link">
              Privacy
            </Link>
            <Link to="/terms" style={{ color: '#f6a300', textDecoration: 'none' }} className="footer-link">
              Terms
            </Link>
            <a href="mailto:support@safevault.com" style={{ color: '#f6a300', textDecoration: 'none' }} className="footer-link">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}