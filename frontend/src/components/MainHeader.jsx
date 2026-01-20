import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function MainHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const token = localStorage.getItem("authToken");

  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    setOpen(false);
    navigate("/login");
  };

  // close menu when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header className="bg-light border-bottom">
      <div className="container py-3 d-flex align-items-center justify-content-between">
        <Link to="/" className="text-decoration-none fw-bold" style={{ color: "#f6a300" }}>
          SAFE-VAULT
        </Link>

        <nav className="d-flex gap-4">
          <NavLink
            to="/about"
            className={({ isActive }) => `text-decoration-none fw-semibold ${isActive ? "text-dark" : ""}`}
            style={{ color: "#f6a300" }}
          >
            ABOUT US
          </NavLink>

          <NavLink
            to="/help"
            className={({ isActive }) => `text-decoration-none fw-semibold ${isActive ? "text-dark" : ""}`}
            style={{ color: "#f6a300" }}
          >
            HELP CENTER
          </NavLink>

          <NavLink
            to="/subscriptions"
            className={({ isActive }) => `text-decoration-none fw-semibold ${isActive ? "text-dark" : ""}`}
            style={{ color: "#f6a300" }}
          >
            SUBSCRIPTIONS
          </NavLink>
        </nav>

        {/* User icon + dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <div
            onClick={() => setOpen((v) => !v)}
            className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 36,
              height: 36,
              background: "#111",
              color: "#f6a300",
              textDecoration: "none",
              cursor: "pointer",
              userSelect: "none",
            }}
            aria-label="User"
            title={token ? "Account" : "Login"}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>👤</span>
          </div>

          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                background: "#111",
                borderRadius: 10,
                padding: 8,
                minWidth: 160,
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                zIndex: 9999,
              }}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/vault/settings"); 
                }}
                style={menuBtn}
              >
                Settings
              </button>

              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "6px 0" }} />

              {token ? (
                <button onClick={logout} style={menuBtn}>
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  style={menuBtn}
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const menuBtn = {
  width: "100%",
  background: "transparent",
  border: "none",
  color: "#f6a300",
  fontWeight: 800,
  textAlign: "left",
  padding: "10px 10px",
  borderRadius: 8,
  cursor: "pointer",
};