import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FolderDetails() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

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
    const type = prompt("Type 'folder' or 'file' to add:");
    const t = (type || "").toLowerCase();
    if (!t || !["folder", "file"].includes(t)) {
      alert("Please type 'folder' or 'file'.");
      return;
    }

    // For files: we navigate to Upload screen (real upload)
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
    if (item.type === "folder") {
      navigate(`/vault/folders/${item.id}`);
      return;
    }

    // file: download
    window.open(`${BASE_URL}/files/${item.id}/download`, "_blank");
  };

  const deleteItem = async (item) => {
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
    <div style={wrap}>
      <div style={board}>
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
            <div key={item.id} style={card} onClick={() => openItem(item)}>
              <div style={iconBox}>{item.type === "folder" ? "📁" : "📄"}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={name}>{item.name}</div>
                <div style={meta}>
                  {item.type === "folder"
                    ? `${item.count || 0} items`
                    : item.size || "—"}
                </div>
              </div>

              <button
                style={miniBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item);
                }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Styles
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

const card = {
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

const miniBtn = {
  background: "rgba(0,0,0,0.3)",
  border: "none",
  color: "#fff",
  width: 32,
  height: 32,
  borderRadius: 8,
  cursor: "pointer",
};

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
