import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FolderDetails() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  // which card menu is open
  const [menuOpenId, setMenuOpenId] = useState(null);

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
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const title = useMemo(() => {
    if (folderName) return `Folder: ${folderName}`;
    return `Folder: ${folderId}`;
  }, [folderId, folderName]);

  const addItem = async () => {
    closeMenu();

    const type = prompt("Type 'folder' or 'file' to add:");
    const t = (type || "").toLowerCase();
    if (!t || !["folder", "file"].includes(t)) {
      alert("Please type 'folder' or 'file'.");
      return;
    }

    // For files: navigate to Upload screen (real upload)
    if (t === "file") {
      navigate(`/vault/folders/${folderId}/upload`);
      return;
    }

    // For folder: create subfolder
    const name = prompt("Enter folder name:");
    if (!name) return;

    try {
      const r = await api(`/folders/${folderId}/folders`, {
        method: "POST",
        body: { name },
      });

      // backend returns { id, type:'folder', name, count }
      setItems((prev) => [...prev, r.data]);
    } catch (e) {
      alert(e.message);
    }
  };

  const openItem = (item) => {
    closeMenu();

    if (item.type === "folder") {
      navigate(`/vault/folders/${item.id}`);
      return;
    }

    // file: preview (browser will preview PDFs/images, download others)
    window.open(`${BASE_URL}/files/${item.id}/download`, "_blank");
  };

  const downloadFile = async (item) => {
    closeMenu();

    try {
      const res = await fetch(`${BASE_URL}/files/${item.id}/download`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
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
    } catch (e) {
      alert(e.message);
    }
  };

  const renameItem = async (item) => {
    closeMenu();

    const newName = prompt("Enter new name:", item.name || "");
    if (!newName) return;

    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      if (item.type === "folder") {
        // rename folder
        const r = await api(`/folders/${item.id}`, {
          method: "PATCH",
          body: { name: trimmed },
        });

        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, name: r.data.name } : x))
        );
      } else {
        // rename file (most common REST style)
        // If your backend uses a different endpoint, tell me what it is and I’ll adjust.
        const r = await api(`/files/${item.id}`, {
          method: "PATCH",
          body: { name: trimmed },
        });

        // some backends return { data: {...} } or just { name }
        const updatedName = r?.data?.originalName || r?.data?.name || r?.name || trimmed;

        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, name: updatedName } : x))
        );
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteItem = async (item) => {
    closeMenu();

    if (!confirm("Delete this item?")) return;

    try {
      if (item.type === "folder") {
        await api(`/folders/${item.id}`, { method: "DELETE" });
      } else {
        await api(`/files/${item.id}`, { method: "DELETE" });
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={wrap} onClick={closeMenu}>
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
                  <div style={name} title={item.name}>
                    {item.name}
                  </div>
                  <div style={meta}>
                    {item.type === "folder"
                      ? `${item.count || 0} items`
                      : item.size || "—"}
                  </div>
                </div>

                {/* menu dots */}
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

                {/* dropdown menu */}
                {menuOpenId === item.id && (
                  <div
                    style={menu}
                    onClick={(e) => e.stopPropagation()}
                    role="menu"
                    aria-label="Item actions"
                  >
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
      style={{
        ...menuItem,
        color: danger ? "#ffb4b4" : "#e9e9e9",
      }}
      role="menuitem"
    >
      {label}
    </button>
  );
}

/* =========================
   Styles (keep your design)
========================= */
const wrap = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  paddingTop: 18,
};

const board = {
  width: "100%",
  maxWidth: 980,
  background: "#0f0f0f",
  borderRadius: 16,
  padding: 22,
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  minHeight: 520,
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
  flexWrap: "wrap",
};

const titleStyle = { color: "#fff", fontWeight: 900, fontSize: 18 };
const subStyle = { color: "#9aa0a6", fontSize: 12 };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const tileWrap = {
  width: "100%",
};

const card = {
  position: "relative",
  background: "#6a625a",
  borderRadius: 10,
  padding: 14,
  display: "flex",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
};

const iconBox = {
  width: 44,
  height: 34,
  borderRadius: 8,
  background: "rgba(246,163,0,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const name = {
  color: "#fff",
  fontWeight: 900,
  fontSize: 14,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const meta = { color: "rgba(255,255,255,0.7)", fontSize: 11 };

const btnGhost = {
  background: "transparent",
  border: "1px solid rgba(246,163,0,0.4)",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "8px 14px",
};

const btnPrimary = {
  background: "#f6a300",
  border: "none",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "8px 14px",
};

/* dots menu (same idea as folders page) */
const dotsBtn = {
  border: "none",
  background: "transparent",
  color: "#fff",
  fontSize: 22,
  lineHeight: "22px",
  padding: "2px 6px",
  cursor: "pointer",
};

const menu = {
  position: "absolute",
  top: 52,
  right: 10,
  width: 160,
  background: "rgba(10,10,10,0.92)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  padding: 6,
  boxShadow: "0 18px 36px rgba(0,0,0,0.45)",
  zIndex: 20,
};

const menuItem = {
  width: "100%",
  textAlign: "left",
  border: "none",
  background: "transparent",
  padding: "9px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const menuDivider = {
  height: 1,
  background: "rgba(255,255,255,0.08)",
  margin: "6px 6px",
};
