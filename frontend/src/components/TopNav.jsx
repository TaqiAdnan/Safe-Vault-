import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const token = localStorage.getItem("authToken");

  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    setOpen(false);
    navigate("/login");
  };

  // close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div
      style={{
        height: 64,
        background: "#141414",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
      }}
    >
      <div style={{ color: "#d6d6d6", fontWeight: 700 }}>SafeVault Directory</div>

      {/*  Avatar + menu */}
      <div ref={ref} style={{ position: "relative" }}>
        <div
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#f6a300",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            color: "#111",
            cursor: "pointer",
            userSelect: "none",
          }}
          title="Account"
        >
          U
        </div>

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 48,
              background: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              minWidth: 160,
              padding: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
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
