import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [dialog, setDialog] = useState(null); 
  const [alert, setAlert] = useState(null); 
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const api = async (path, { method = "GET", body } = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data;
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await api("/folders");
        setFolders(r.data || []);
      } catch (e) {
        showAlert(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const closeMenu = () => setMenuOpenId(null);

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  const openCreate = () => {
    closeMenu();
    setDialog({
      type: 'input',
      title: 'Create New Folder',
      message: 'Give your folder a clear name so you can find it later.',
      placeholder: 'e.g., Projects',
      onConfirm: async (name) => {
        if (!name?.trim()) {
          showAlert("Please enter a folder name");
          return;
        }
        
        setDialog(null);
        try {
          const r = await api("/folders", { method: "POST", body: { name: name.trim() } });
          setFolders((prev) => [r.data, ...prev]);
          showAlert("Folder created successfully!");
        } catch (e) {
          showAlert(e.message);
        }
      },
      onCancel: () => setDialog(null)
    });
  };

  const openRename = (id) => {
    closeMenu();
    const f = folders.find((x) => x.id === id);
    
    setDialog({
      type: 'input',
      title: 'Rename Folder',
      message: 'Update the folder name.',
      defaultValue: f?.name || '',
      placeholder: 'Folder name',
      onConfirm: async (name) => {
        if (!name?.trim()) {
          showAlert("Please enter a folder name");
          return;
        }
        
        setDialog(null);
        try {
          const r = await api(`/folders/${id}`, {
            method: "PATCH",
            body: { name: name.trim() },
          });
          setFolders((prev) =>
            prev.map((folder) => (folder.id === id ? { ...folder, name: r.data.name } : folder))
          );
          showAlert("Folder renamed successfully!");
        } catch (e) {
          showAlert(e.message);
        }
      },
      onCancel: () => setDialog(null)
    });
  };

  const openDelete = (id) => {
    closeMenu();
    const f = folders.find((x) => x.id === id);
    const hasContent = (f?.count || 0) > 0;
    
    setDialog({
      type: 'confirm',
      title: 'Delete Folder',
      message: `Are you sure you want to delete "${f?.name || "this folder"}"?`,
      subMessage: hasContent 
        ? 'This folder is not empty. All contents will be permanently deleted.' 
        : 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
      onConfirm: async () => {
        setDialog(null);
        try {
          await api(`/folders/${id}`, { method: "DELETE" });
          setFolders((prev) => prev.filter((folder) => folder.id !== id));
          showAlert("Folder deleted successfully!");
        } catch (e) {
          showAlert(e.message);
        }
      },
      onCancel: () => setDialog(null)
    });
  };

  const openFolder = (id) => {
    closeMenu();
    navigate(`/vault/folders/${id}`);
  };

  const exportFolder = async (id) => {
    closeMenu();
    try {
      const res = await fetch(`${BASE_URL}/folders/${id}/export`, {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `folder-${id}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showAlert("Folder exported successfully!");
    } catch (e) {
      showAlert(e.message);
    }
  };

  return (
    <div style={wrap} onClick={closeMenu}>
    
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

    
      {dialog && (
        <div style={overlay} onClick={() => dialog.onCancel?.()}>
          <div style={dialogBox} onClick={(e) => e.stopPropagation()}>
            <div style={dialogHeader}>
              <h3 style={dialogTitle}>{dialog.title}</h3>
            </div>

            <div style={dialogBody}>
              <p style={dialogMessage}>{dialog.message}</p>
              {dialog.subMessage && (
                <p style={dialogSubMessage}>{dialog.subMessage}</p>
              )}

              {dialog.type === 'input' && (
                <input
                  type="text"
                  autoFocus
                  defaultValue={dialog.defaultValue || ''}
                  placeholder={dialog.placeholder}
                  style={dialogInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      dialog.onConfirm(e.target.value);
                    }
                  }}
                  id="dialog-input"
                />
              )}
            </div>

            <div style={dialogFooter}>
              <button
                style={btnSecondary}
                onClick={() => dialog.onCancel?.()}
              >
                {dialog.cancelText || 'Cancel'}
              </button>
              
              {dialog.type === 'input' && (
                <button
                  style={btnPrimary}
                  onClick={() => {
                    const input = document.getElementById('dialog-input');
                    dialog.onConfirm(input?.value || '');
                  }}
                >
                  {dialog.confirmText || 'OK'}
                </button>
              )}
              
              {dialog.type === 'confirm' && (
                <button
                  style={dialog.danger ? btnDanger : btnPrimary}
                  onClick={() => dialog.onConfirm()}
                >
                  {dialog.confirmText || 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={board} onClick={(e) => e.stopPropagation()}>
        <div style={topRow}>
          <div style={pageTitle}>Folders</div>
         
        </div>

        {loading && (
          <div style={{ color: "#9aa0a6", fontSize: 12, marginBottom: 10 }}>Loading...</div>
        )}

        {folders.length === 0 && !loading && (
          <div style={{ color: "#9aa0a6", fontSize: 14, textAlign: "center", marginTop: 50 }}>
            No folders yet. Click + to create one.
          </div>
        )}

        <div style={grid}>
          {folders.map((f) => (
            <div key={f.id} style={tileWrap}>
              <div style={tile} onClick={() => openFolder(f.id)}>
                <div style={folderIcon}>📁</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={folderName} title={f.name}>
                    {f.name}
                  </div>
                  <div style={folderCount}>{f.count || 0} items</div>
                </div>
                <button
                  type="button"
                  style={dotsBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId((prev) => (prev === f.id ? null : f.id));
                  }}
                  aria-label="Folder menu"
                  title="Menu"
                >
                  ⋯
                </button>

                {menuOpenId === f.id && (
                  <div style={menu} onClick={(e) => e.stopPropagation()} role="menu">
                    <MenuItem label="Open folder" onClick={() => openFolder(f.id)} />
                    <MenuItem label="Rename" onClick={() => openRename(f.id)} />
                    <div style={menuDivider} />
                    <MenuItem label="Export" onClick={() => exportFolder(f.id)} />
                    <MenuItem label="Delete" danger onClick={() => openDelete(f.id)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="button" style={plusBtn} onClick={openCreate} disabled={loading}>
          +
        </button>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...menuItem, color: danger ? "#ffb4b4" : "#e9e9e9" }}
      role="menuitem"
    >
      {label}
    </button>
  );
}

/* ========================= Styles ========================= */
const wrap = { width: "100%", display: "flex", justifyContent: "center", paddingTop: 18 };
const board = { position: "relative", width: "100%", maxWidth: 980, background: "#0f0f0f", borderRadius: 16, padding: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 520 };
const topRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 };
const pageTitle = { color: "#d6d6d6", fontWeight: 800, fontSize: 16 };
const userDot = { width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 };
const grid = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22, alignContent: "start", justifyItems: "center", paddingTop: 10 };
const tileWrap = { width: "100%", maxWidth: 330 };
const tile = { position: "relative", width: "100%", background: "#6a625a", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 10px 18px rgba(0,0,0,0.25)", cursor: "pointer" };
const folderIcon = { width: 44, height: 34, borderRadius: 8, background: "rgba(246,163,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 };
const folderName = { color: "#f2f2f2", fontWeight: 900, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const folderCount = { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 };
const dotsBtn = { border: "none", background: "transparent", color: "#fff", fontSize: 22, lineHeight: "22px", padding: "2px 6px", cursor: "pointer" };
const menu = { position: "absolute", top: 44, right: 10, width: 150, background: "rgba(10,10,10,0.92)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: 6, boxShadow: "0 18px 36px rgba(0,0,0,0.45)", zIndex: 20 };
const menuItem = { width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 };
const menuDivider = { height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 6px" };
const plusBtn = { position: "absolute", right: 18, bottom: 18, width: 64, height: 64, borderRadius: "50%", background: "#f6a300", border: "none", color: "#fff", fontSize: 34, fontWeight: 700, lineHeight: "64px", textAlign: "center", boxShadow: "0 12px 22px rgba(0,0,0,0.35)", cursor: "pointer" };


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
  margin: "0 0 16px 0",
  color: "#d1d5db",
  fontSize: 14,
  lineHeight: 1.5
};

const dialogSubMessage = {
  margin: "-8px 0 16px 0",
  color: "#9ca3af",
  fontSize: 13,
  lineHeight: 1.4
};

const dialogInput = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#2a2a2a",
  color: "#fff",
  fontSize: 14,
  outline: "none"
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

const btnPrimary = {
  background: "#f6a300",
  border: "none",
  color: "#111",
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