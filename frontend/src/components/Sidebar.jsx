import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    color: isActive ? "#111" : "#d6d6d6",
    background: isActive ? "#f6a300" : "transparent",
    textDecoration: "none",
    fontWeight: 700,
    marginBottom: 6,
  });

  return (
    <aside
      style={{
        width: 220,
        background: "#0f0f0f",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: 16,
      }}
    >
      <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, marginBottom: 18 }}>
        Safe<span style={{ color: "#f6a300" }}>Vault</span>
      </div>

      <nav className="d-flex flex-column">
        <NavLink to="/vault/folders" style={linkStyle}>📁 Folders</NavLink>
        <NavLink to="/vault/notes" style={linkStyle}>📝 Notes</NavLink>
        <NavLink to="/vault/search" style={linkStyle}>🔎 Search</NavLink>
        <NavLink to="/vault/settings" style={linkStyle}>⚙ Settings</NavLink>
      </nav>
    </aside>
  );
}
