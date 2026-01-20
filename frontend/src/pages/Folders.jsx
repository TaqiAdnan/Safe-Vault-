import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Folders() {
  const [folders, setFolders] = useState([]);

  const [loading, setLoading] = useState(false);

  // which card menu is open
  const [menuOpenId, setMenuOpenId] = useState(null);
  const navigate = useNavigate();

  // modal state
  const [modal, setModal] = useState({ open: false, mode: "create", folderId: null });
  const [nameInput, setNameInput] = useState("");

  const overlayRef = useRef(null);

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
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFolder = useMemo(
    () => folders.find((f) => f.id === modal.folderId) || null,
    [folders, modal.folderId]
  );

  const closeMenu = () => setMenuOpenId(null);

  const openCreate = () => {
    closeMenu();
    setNameInput("");
    setModal({ open: true, mode: "create", folderId: null });
  };

  const openRename = (id) => {
    closeMenu();
    const f = folders.find((x) => x.id === id);
    setNameInput(f?.name || "");
    setModal({ open: true, mode: "rename", folderId: id });
  };

  const openDelete = (id) => {
    closeMenu();
    const f = folders.find((x) => x.id === id);
    setNameInput(f?.name || "");
    setModal({ open: true, mode: "delete", folderId: id });
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
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
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
  } catch (e) {
    alert(e.message);
  }
};




  const saveModal = async () => {
    const trimmed = nameInput.trim();

    try {
      if (modal.mode === "create") {
        if (!trimmed) return alert("Please enter a folder name.");

        const r = await api("/folders", { method: "POST", body: { name: trimmed } });
        setFolders((prev) => [r.data, ...prev]);

        setModal({ open: false, mode: "create", folderId: null });
        setNameInput("");
        return;
      }

      if (modal.mode === "rename") {
        if (!trimmed) return alert("Please enter a folder name.");

        const r = await api(`/folders/${modal.folderId}`, {
          method: "PATCH",
          body: { name: trimmed },
        });

        setFolders((prev) =>
          prev.map((f) => (f.id === modal.folderId ? { ...f, name: r.data.name } : f))
        );

        setModal({ open: false, mode: "rename", folderId: null });
        setNameInput("");
        return;
      }

      if (modal.mode === "delete") {
        await api(`/folders/${modal.folderId}`, { method: "DELETE" });

        setFolders((prev) => prev.filter((f) => f.id !== modal.folderId));
        setModal({ open: false, mode: "delete", folderId: null });
        setNameInput("");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create", folderId: null });
    setNameInput("");
  };

  return (
    <div style={wrap} onClick={() => closeMenu()}>
      <div style={board} onClick={(e) => e.stopPropagation()}>
        {/* Title row like the design */}
        <div style={topRow}>
          <div style={pageTitle}>Folders</div>
          <div style={userDot} title="User" aria-label="User">
            👤
          </div>
        </div>

        {loading && (
          <div style={{ color: "#9aa0a6", fontSize: 12, marginBottom: 10 }}>Loading...</div>
        )}

        {/* Grid */}
        <div style={grid}>
          {folders.map((f) => (
            <div key={f.id} style={tileWrap}>
              <div style={tile} onClick={() => openFolder(f.id)}>
                {/* left icon */}
                <div style={folderIcon} aria-hidden="true">
                  📁
                </div>

                {/* name + count */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={folderName} title={f.name}>
                    {f.name}
                  </div>
                  <div style={folderCount}>{f.count || 0} items</div>
                </div>

                {/* menu dots */}
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

                {/* dropdown menu */}
                {menuOpenId === f.id && (
                  <div
                    style={menu}
                    onClick={(e) => e.stopPropagation()}
                    role="menu"
                    aria-label="Folder actions"
                  >
                    <MenuItem label="Open folder" onClick={() => openFolder(f.id)} />
                    <MenuItem label="Rename" onClick={() => openRename(f.id)} />
                    <div style={menuDivider} />
                    <MenuItem label="Export" onClick={() => exportFolder(f.id, f.name)} />
                    <MenuItem label="Delete" danger onClick={() => openDelete(f.id)} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Floating + create folder */}
        <button
          type="button"
          style={plusBtn}
          onClick={openCreate}
          aria-label="Create folder"
          disabled={loading}
        >
          +
        </button>
      </div>

      {/* Modal */}
      {modal.open && (
        <div
          ref={overlayRef}
          style={overlay}
          onClick={(e) => {
            if (e.target === overlayRef.current) closeModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div style={modalCard}>
            <div style={modalTitle}>
              {modal.mode === "create" && "Create New Folder"}
              {modal.mode === "rename" && "Rename Folder"}
              {modal.mode === "delete" && "Delete Folder"}
            </div>

            <div style={modalSub}>
              {modal.mode === "create" && "Give your folder a clear name so you can find it later."}
              {modal.mode === "rename" && "Update the folder name."}
              {modal.mode === "delete" && `This will delete "${activeFolder?.name || "this folder"}" `}
            </div>

            {(modal.mode === "create" || modal.mode === "rename") && (
              <div style={{ marginTop: 14 }}>
                <div style={label}>FOLDER NAME</div>
                <input
                  className="form-control"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g., Projects"
                  style={input}
                  autoFocus
                />
              </div>
            )}

            {modal.mode === "delete" && (
              <div style={dangerBox}>
                 please look into what you are deleting before you delete this folder.
              </div>
            )}

            <div style={modalActions}>
              <button type="button" style={btnGhost} onClick={closeModal} disabled={loading}>
                Cancel
              </button>

              <button
                type="button"
                style={modal.mode === "delete" ? btnDanger : btnPrimary}
                onClick={saveModal}
                disabled={loading}
              >
                {modal.mode === "create" && "Create"}
                {modal.mode === "rename" && "Save"}
                {modal.mode === "delete" && "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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

/* ===== styles (match your design) ===== */
const wrap = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
  paddingTop: 18,
};

const board = {
  position: "relative",
  width: "100%",
  maxWidth: 980,
  background: "#0f0f0f",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.06)",
  minHeight: 520,
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
};

const pageTitle = {
  color: "#d6d6d6",
  fontWeight: 800,
  fontSize: 16,
};

const userDot = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 22,
  alignContent: "start",
  justifyItems: "center",
  paddingTop: 10,
};

const tileWrap = {
  width: "100%",
  maxWidth: 330,
};

const tile = {
  position: "relative",
  width: "100%",
  background: "#6a625a",
  borderRadius: 10,
  padding: 16,
  display: "flex",
  alignItems: "center",
  gap: 12,
  boxShadow: "0 10px 18px rgba(0,0,0,0.25)",
};

const folderIcon = {
  width: 44,
  height: 34,
  borderRadius: 8,
  background: "rgba(246,163,0,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const folderName = {
  color: "#f2f2f2",
  fontWeight: 900,
  fontSize: 14,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const folderCount = {
  color: "rgba(255,255,255,0.75)",
  fontSize: 11,
  marginTop: 2,
};

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
  top: 44,
  right: 10,
  width: 150,
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

const plusBtn = {
  position: "absolute",
  right: 18,
  bottom: 18,
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#f6a300",
  border: "none",
  color: "#fff",
  fontSize: 34,
  fontWeight: 700,
  lineHeight: "64px",
  textAlign: "center",
  boxShadow: "0 12px 22px rgba(0,0,0,0.35)",
  cursor: "pointer",
};

/* modal */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  zIndex: 999,
};

const modalCard = {
  width: "100%",
  maxWidth: 520,
  background: "#111",
  borderRadius: 14,
  padding: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
};

const modalTitle = {
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
};

const modalSub = {
  marginTop: 6,
  color: "#9aa0a6",
  fontSize: 12,
};

const label = {
  color: "#d6d6d6",
  fontWeight: 800,
  fontSize: 12,
  marginBottom: 6,
};

const input = {
  background: "#6a625a",
  border: "none",
  color: "white",
  borderRadius: 10,
  height: 44,
};

const modalActions = {
  marginTop: 16,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const btnGhost = {
  background: "transparent",
  border: "1px solid rgba(246,163,0,0.35)",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
};

const btnPrimary = {
  background: "#f6a300",
  border: "none",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
};

const btnDanger = {
  background: "#ff5a5a",
  border: "none",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
};

const dangerBox = {
  marginTop: 14,
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,90,90,0.10)",
  border: "1px solid rgba(255,90,90,0.22)",
  color: "#ffd3d3",
  fontSize: 12,
};
