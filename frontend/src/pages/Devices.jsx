import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/http";

export default function Devices() {
  const navigate = useNavigate();

  const sessionEmail = useMemo(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem("safevault_login") || "null");
      return s?.email || "";
    } catch {
      return "";
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);

  const [open, setOpen] = useState(false);
  const [activeDevice, setActiveDevice] = useState(null);
  const [name, setName] = useState("");

  const [alert, setAlert] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  const hardLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  const loadDevices = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return hardLogout();
  
    try {
      setLoading(true);
  
      const res = await api("/settings/devices", { token });
  
      setDevices(Array.isArray(res?.devices) ? res.devices : []);
    } catch (err) {
      if (err.status === 401) return hardLogout();
      showAlert(err.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadDevices();
    
  }, []);

  const onOpenRename = (d) => {
    setActiveDevice(d);
    setName(d.name || "");
    setOpen(true);
  };

  const onRename = async (e) => {
    e.preventDefault();
    if (!activeDevice?.deviceId) return;
  
    const token = localStorage.getItem("authToken");
    if (!token) return hardLogout();
  
    const MAX = 80;
    const trimmed = name.trim().slice(0, MAX);
  
    try {
      await api(`/settings/devices/${encodeURIComponent(activeDevice.deviceId)}`, {
        method: "PATCH",
        token,
        body: { name: trimmed },
      });
  
      setDevices((prev) =>
        prev.map((x) =>
          x.deviceId === activeDevice.deviceId
            ? { ...x, name: trimmed, lastUsedAt: new Date().toISOString() }
            : x
        )
      );
  
      setOpen(false);
      setActiveDevice(null);
      setName("");
    } catch (err) {
      if (err.status === 401) return hardLogout();
      showAlert(err.message || "Rename failed");
    }
  };

  const onRemove = async (deviceId) => {
    showConfirm("Remove this device?", async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return hardLogout();

      try {
        await api(`/settings/devices/${encodeURIComponent(deviceId)}`, {
          method: "DELETE",
          token,
        });

        setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
        setConfirmDialog(null);
      } catch (err) {
        if (err.status === 401) return hardLogout();
        showAlert(err.message || "Remove failed");
        setConfirmDialog(null);
      }
    });
  };

  const onRemoveAll = async () => {
    showConfirm("Remove ALL devices? This will require re-confirming devices on next login.", async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return hardLogout();

      try {
        await api("/settings/devices", { method: "DELETE", token });
        setDevices([]);
        setConfirmDialog(null);
      } catch (err) {
        if (err.status === 401) return hardLogout();
        showAlert(err.message || "Remove all failed");
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div style={pageWrap}>
      {alert && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 18px",
          borderRadius: 8,
          background: "#f6a300",
          color: "#111",
          fontWeight: 700,
          zIndex: 10001,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center"
        }}>
          {alert.message}
        </div>
      )}

      {confirmDialog && (
        <div style={overlay} onClick={() => setConfirmDialog(null)}>
          <div style={dialogBox} onClick={(e) => e.stopPropagation()}>
            <div style={dialogHeader}>
              <h3 style={dialogTitle}>Confirm Action</h3>
            </div>

            <div style={dialogBody}>
              <p style={dialogMessage}>{confirmDialog.message}</p>
            </div>

            <div style={dialogFooter}>
              <button
                style={btnSecondary}
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </button>
              
              <button
                style={btnDanger}
                onClick={() => confirmDialog.onConfirm()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={panel}>
        <div style={panelHeader}>
          <div>
            <div style={panelTitle}>Trusted Devices</div>
            <div style={panelSub}>Manage devices that can access your vault.</div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button className="btn" style={pillPrimary} onClick={loadDevices} disabled={loading}>
              {loading ? "LOADING..." : "REFRESH"}
            </button>

            <button className="btn" style={pillDangerGhost} onClick={onRemoveAll} disabled={loading}>
              REMOVE ALL
            </button>

            <Link to="/vault/settings" className="btn" style={pillGhost}>
              Back
            </Link>
          </div>
        </div>

        <div style={card}>
          <div style={topRow}>
            <div style={{ color: "#d6d6d6", fontWeight: 800 }}>
              Account: <span style={{ color: "#f6a300" }}>{sessionEmail || "User"}</span>
            </div>
            <div style={hint}>Tip: Remove devices you don't recognize.</div>
          </div>

          <div className="table-responsive" style={{ marginTop: 14 }}>
            <table className="table table-dark table-borderless align-middle mb-0">
              <thead>
                <tr style={{ color: "#bdbdbd", fontSize: 12 }}>
                  <th>DEVICE</th>
                  <th>LAST USED</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.deviceId} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ fontWeight: 800 }}>
                      <span style={deviceDot} />
                      {d.name || "Unnamed device"}
                      <div style={{ color: "#9aa0a6", fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                        ID: {shortId(d.deviceId)}
                      </div>
                    </td>

                    <td style={{ color: "#d6d6d6" }}>{formatDate(d.lastUsedAt)}</td>

                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-sm" style={miniBtn} onClick={() => onOpenRename(d)}>
                        Rename
                      </button>{" "}
                      <button className="btn btn-sm" style={miniDanger} onClick={() => onRemove(d.deviceId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && devices.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ color: "#d6d6d6", padding: 18 }}>
                      No trusted devices yet. Log in from a device and confirm it to appear here.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={3} style={{ color: "#d6d6d6", padding: 18 }}>
                      Loading devices...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {open && (
          <div style={modalOverlay} onMouseDown={() => setOpen(false)}>
            <div style={modal} onMouseDown={(e) => e.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div style={{ fontWeight: 900, color: "#f6a300" }}>Rename Device</div>
                <button className="btn btn-sm" style={miniGhost} onClick={() => setOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={onRename} className="d-flex flex-column gap-3">
                <div style={{ color: "#bdbdbd", fontSize: 12 }}>
                  Device ID: <b>{shortId(activeDevice?.deviceId || "")}</b>
                </div>

                <div>
                  <div style={label}>DEVICE NAME</div>
                  <input
                    className="form-control"
                    value={name}
                    maxLength={80} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., My Laptop"
                    style={inputStyle}
                  />
                </div>

                <button className="btn" style={pillPrimary} type="submit">
                  SAVE
                </button>

                <div style={{ color: "#bdbdbd", fontSize: 12, lineHeight: 1.6 }}>
                  Note: "Last used" is updated automatically by the backend when you log in from that device.
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso) {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso || "—";
  }
}

function shortId(id) {
  if (!id) return "—";
  if (id.length <= 10) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

const deviceDot = { display: "inline-block", width: 10, height: 10, borderRadius: "50%", marginRight: 10, verticalAlign: "middle", background: "#f6a300" };
const pageWrap = { width: "100%", minHeight: "calc(100vh - 120px)", display: "flex", justifyContent: "center", alignItems: "center" };
const panel = { width: "100%", maxWidth: 1120, padding: 22, borderRadius: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" };
const panelHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 };
const panelTitle = { color: "#fff", fontWeight: 900, fontSize: 18 };
const panelSub = { color: "#9aa0a6", fontSize: 12, marginTop: 2 };
const card = { width: "100%", background: "#111", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" };
const topRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" };
const hint = { color: "#bdbdbd", fontSize: 12, background: "rgba(246,163,0,0.08)", border: "1px solid rgba(246,163,0,0.2)", padding: "6px 10px", borderRadius: 999 };
const pillPrimary = { background: "#f6a300", color: "#111", borderRadius: 999, fontWeight: 900, padding: "10px 14px", border: "none" };
const pillGhost = { background: "transparent", color: "#f6a300", borderRadius: 999, fontWeight: 900, padding: "10px 14px", border: "1px solid rgba(246,163,0,0.45)" };
const pillDangerGhost = { background: "transparent", color: "#ffb4b4", borderRadius: 999, fontWeight: 900, padding: "10px 14px", border: "1px solid rgba(239,68,68,0.35)" };
const miniBtn = { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontWeight: 800, borderRadius: 10 };
const miniDanger = { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#ffb4b4", fontWeight: 800, borderRadius: 10 };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 };
const modal = { width: "100%", maxWidth: 520, background: "#111", borderRadius: 16, padding: 18, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.45)" };
const label = { color: "#d6d6d6", fontWeight: 800, fontSize: 12, marginBottom: 6 };
const inputStyle = { background: "#6a625a", border: "none", color: "white", borderRadius: 10 };
const miniGhost = { background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 10 };

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000
};

const dialogBox = {
  background: "#1a1a1a",
  borderRadius: 12,
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.1)"
};

const dialogHeader = {
  padding: "20px 24px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.1)"
};

const dialogTitle = {
  margin: 0,
  color: "#fff",
  fontSize: 18,
  fontWeight: 900
};

const dialogBody = {
  padding: "20px 24px"
};

const dialogMessage = {
  margin: 0,
  color: "#d1d5db",
  fontSize: 14,
  lineHeight: 1.5
};

const dialogFooter = {
  padding: "16px 24px 20px",
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  borderTop: "1px solid rgba(255,255,255,0.1)"
};

const btnSecondary = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#d1d5db",
  borderRadius: 8,
  fontWeight: 700,
  padding: "10px 20px",
  cursor: "pointer",
  fontSize: 14
};

const btnDanger = {
  background: "#ef4444",
  border: "none",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 700,
  padding: "10px 20px",
  cursor: "pointer",
  fontSize: 14
};