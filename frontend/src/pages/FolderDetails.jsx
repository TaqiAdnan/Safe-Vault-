import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FolderDetails() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [alert, setAlert] = useState(null); 
  const [dialog, setDialog] = useState(null); 

  const token = localStorage.getItem("authToken");

  const showAlert = (message, type = "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

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

  const closeMenu = () => setMenuOpenId(null);

  useEffect(() => {
    const load = async () => {
      if (!folderId) return;

      try {
        setLoading(true);
        const r = await api(`/folders/${folderId}/items`);
        const payload = r?.data || {};
        setItems(payload.items || []);
        setFolderName(payload.folder?.name || "");
      } catch (e) {
        showAlert(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
   
  }, [folderId]);

  const title = useMemo(() => {
    if (folderName) return `Folder: ${folderName}`;
    return `Folder: ${folderId}`;
  }, [folderId, folderName]);

  const addItem = async () => {
    closeMenu();

    setDialog({
      type: 'select',
      title: 'Add New Item',
      message: 'What would you like to add?',
      options: [
        { label: '📁 Folder', value: 'folder' },
        { label: '📄 File', value: 'file' }
      ],
      onConfirm: async (selected) => {
        setDialog(null);
        
        if (selected === 'file') {
          navigate(`/vault/folders/${folderId}/upload`);
          return;
        }

        setDialog({
          type: 'input',
          title: 'Create Folder',
          message: 'Enter folder name:',
          placeholder: 'My Folder',
          onConfirm: async (name) => {
            setDialog(null);
            if (!name?.trim()) return;

            try {
              const r = await api(`/folders/${folderId}/folders`, {
                method: "POST",
                body: { name: name.trim() },
              });
              setItems((prev) => [...prev, r.data]);
              showAlert("Folder created successfully!", "success");
            } catch (e) {
              showAlert(e.message);
            }
          },
          onCancel: () => setDialog(null)
        });
      },
      onCancel: () => setDialog(null)
    });
  };

  const openItem = (item) => {
    closeMenu();
    if (item.type === "folder") {
      navigate(`/vault/folders/${item.id}`);
      return;
    }
    window.open(`${BASE_URL}/files/${item.id}/download`, "_blank");
  };

  const downloadFile = async (item) => {
    closeMenu();
    try {
      const res = await fetch(`${BASE_URL}/files/${item.id}/download`, {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showAlert("File downloaded successfully!", "success");
    } catch (e) {
      showAlert(e.message);
    }
  };

  const renameItem = async (item) => {
  closeMenu();

  setDialog({
    type: 'input',
    title: `Rename ${item.type === 'folder' ? 'Folder' : 'File'}`,
    message: 'Enter new name:',
    defaultValue: item.type === 'file' ? item.name.replace(/\.[^/.]+$/, "") : item.name,
    placeholder: item.type === 'file' ? item.name.replace(/\.[^/.]+$/, "") : item.name,
   onConfirm: async (newName) => {
  
  if (!newName?.trim()) {
    showAlert("Please enter the new name", "error");
    return; 
  }

  setDialog(null); 

  try {
    if (item.type === "folder") {
      const r = await api(`/folders/${item.id}`, {
        method: "PATCH",
        body: { name: newName.trim() },
      });
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, name: r.data.name } : x))
      );
    } else {
 
      const ext = item.name.includes(".") ? "." + item.name.split(".").pop() : "";
      const fullName = newName.trim() + ext;

      const r = await api(`/files/${item.id}/rename`, {
        method: "PATCH",
        body: { name: fullName },
      });

      const updatedName = r?.data?.originalName || r?.data?.name || fullName;
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, name: updatedName } : x))
      );
    }

    showAlert("Renamed successfully!", "success");
  } catch (e) {
    showAlert(e.message, "error");
  }
},

    onCancel: () => setDialog(null)
  });
};


  const deleteItem = async (item) => {
    closeMenu();
    
    setDialog({
      type: 'confirm',
      title: `Delete ${item.type === 'folder' ? 'Folder' : 'File'}`,
      message: `Are you sure you want to delete "${item.name}"?`,
      subMessage: item.type === 'folder' ? 'All contents will be permanently deleted.' : 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
      onConfirm: async () => {
        setDialog(null);
        try {
          if (item.type === "folder") {
            await api(`/folders/${item.id}`, { method: "DELETE" });
          } else {
            await api(`/files/${item.id}`, { method: "DELETE" });
          }
          setItems((prev) => prev.filter((i) => i.id !== item.id));
          showAlert("Deleted successfully!", "success");
        } catch (e) {
          showAlert(e.message);
        }
      },
      onCancel: () => setDialog(null)
    });
  };

  return (
    <div style={wrap} onClick={closeMenu}>
      {/* Alert Popup */}
      {alert && (
  <div style={{
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 18px",
    borderRadius: 8,
    background: alert.type === 'success' ? "#f6a300" : "#ff5a5a", // برتقالي للنجاح، أحمر للخطأ
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


      {/* Dialog Overlay */}
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

              {dialog.type === 'select' && (
                <div style={optionsContainer}>
                  {dialog.options.map((opt) => (
                    <button
                      key={opt.value}
                      style={optionButton}
                      onClick={() => dialog.onConfirm(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
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
              
              {dialog.type !== 'select' && (
                <button
                  style={dialog.danger ? btnDanger : btnPrimary}
                  onClick={() => {
                    if (dialog.type === 'input') {
                      const input = document.getElementById('dialog-input');
                      dialog.onConfirm(input?.value || '');
                    } else {
                      dialog.onConfirm();
                    }
                  }}
                >
                  {dialog.confirmText || 'OK'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={board} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={topRow}>
          <div>
            <div style={titleStyle}>{title}</div>
            <div style={subStyle}>
              {loading ? "Loading..." : "Folders and files inside this directory"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={btnGhost} onClick={() => navigate("/vault/folders")}>
              Back
            </button>
            <button style={btnPrimary} onClick={addItem} disabled={loading}>
              + Add
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={grid}>
          {items.map((item) => (
            <div key={item.id} style={tileWrap}>
              <div style={card} onClick={() => openItem(item)}>
                <div style={iconBox}>{item.type === "folder" ? "📁" : "📄"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={name} title={item.name}>{item.name}</div>
                  <div style={meta}>{item.type === "folder" ? `${item.count || 0} items` : item.size || "—"}</div>
                </div>

                <button
                  type="button"
                  style={dotsBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId((prev) => (prev === item.id ? null : item.id));
                  }}
                  aria-label="Item menu"
                  title="Menu"
                >
                  ⋯
                </button>

                {menuOpenId === item.id && (
                  <div style={menu} onClick={(e) => e.stopPropagation()} role="menu" aria-label="Item actions">
                    {item.type === "folder" ? (
                      <>
                        <MenuItem label="Open folder" onClick={() => openItem(item)} />
                        <MenuItem label="Rename" onClick={() => renameItem(item)} />
                        <div style={menuDivider} />
                        <MenuItem label="Delete" danger onClick={() => deleteItem(item)} />
                      </>
                    ) : (
                      <>
                        <MenuItem label="Preview" onClick={() => openItem(item)} />
                        <MenuItem label="Download" onClick={() => downloadFile(item)} />
                        <MenuItem label="Rename" onClick={() => renameItem(item)} />
                        <div style={menuDivider} />
                        <MenuItem label="Delete" danger onClick={() => deleteItem(item)} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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


const wrap = { width: "100%", display: "flex", justifyContent: "center", paddingTop: 18 };
const board = { width: "100%", maxWidth: 980, background: "#0f0f0f", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)", minHeight: 520 };
const topRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap" };
const titleStyle = { color: "#fff", fontWeight: 900, fontSize: 18 };
const subStyle = { color: "#9aa0a6", fontSize: 12 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 };
const tileWrap = { width: "100%" };
const card = { position: "relative", background: "#6a625a", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" };
const iconBox = { width: 44, height: 34, borderRadius: 8, background: "rgba(246,163,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 };
const name = { color: "#fff", fontWeight: 900, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const meta = { color: "rgba(255,255,255,0.7)", fontSize: 11 };
const btnGhost = { background: "transparent", border: "1px solid rgba(246,163,0,0.4)", color: "#f6a300", borderRadius: 999, fontWeight: 900, padding: "8px 14px", cursor: "pointer" };
const btnPrimary = { background: "#f6a300", border: "none", color: "#111", borderRadius: 999, fontWeight: 900, padding: "8px 14px", cursor: "pointer" };
const dotsBtn = { border: "none", background: "transparent", color: "#fff", fontSize: 22, lineHeight: "22px", padding: "2px 6px", cursor: "pointer" };
const menu = { position: "absolute", top: 52, right: 10, width: 160, background: "rgba(10,10,10,0.92)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: 6, boxShadow: "0 18px 36px rgba(0,0,0,0.45)", zIndex: 20 };
const menuItem = { width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 };
const menuDivider = { height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 6px" };


const alertStyle = {
  position: "fixed",
  top: 20,
  left: "50%",
  transform: "translateX(-50%)",
  color: "#fff",
  padding: "12px 20px",
  borderRadius: 10,
  zIndex: 9999,
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
};


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

const optionsContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const optionButton = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid rgba(246,163,0,0.3)",
  background: "rgba(246,163,0,0.1)",
  color: "#f6a300",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s"
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