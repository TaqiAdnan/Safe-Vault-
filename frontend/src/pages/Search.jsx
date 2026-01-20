import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Search() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("all"); 
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ notes: [], files: [], folders: [] });

  const getToken = () => localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const api = async (path) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Request failed");
    return data;
  };

  const typeParam = useMemo(() => {
    if (tab === "all") return "all";
    if (tab === "notes") return "notes";
    if (tab === "files") return "files";
    return "folders";
  }, [tab]);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults({ notes: [], files: [], folders: [] });
      return;
    }

    const id = setTimeout(async () => {
      try {
        setLoading(true);
        const r = await api(`/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(typeParam)}`);
        setResults(r?.data || { notes: [], files: [], folders: [] });
      } catch (e) {
        setResults({ notes: [], files: [], folders: [] });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [q, typeParam]);

  const showNotes = tab === "all" || tab === "notes";
  const showFiles = tab === "all" || tab === "files";
  const showFolders = tab === "all" || tab === "folders";

  const openFolder = (folderId) => navigate(`/vault/folders/${folderId}`);
  const openFile = (file) => {
    
    if (file.folderId) navigate(`/vault/folders/${file.folderId}`);
    else navigate(`/vault/folders`);
  };
  const openNote = () => navigate("/vault/notes");

  return (
    <div style={page}>
      {/* Top row */}
      <div style={topRow}>
        <div style={topTitle}>search</div>

        <div style={searchWrap}>
          <span style={searchIcon} aria-hidden="true">
            🔍
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search in Notes , Files ,folders"
            style={searchInput}
          />
        </div>

        <div style={profileBubble} title="Profile">
          <span style={{ fontSize: 14 }}>👤</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabs}>
        <Tab label="All" active={tab === "all"} onClick={() => setTab("all")} />
        <Tab label="Notes" active={tab === "notes"} onClick={() => setTab("notes")} />
        <Tab label="Files" active={tab === "files"} onClick={() => setTab("files")} />
        <Tab label="Folders" active={tab === "folders"} onClick={() => setTab("folders")} />
        {loading && <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Loading…</div>}
      </div>

      {/* Results */}
      <div style={{ marginTop: 18 }}>
        {/* Notes */}
        {showNotes && (
          <div style={{ marginBottom: 22 }}>
            {tab === "all" && <SectionTitle>Notes</SectionTitle>}
            <div style={notesGrid}>
              {results.notes.length === 0 ? (
                <EmptyRow>{q.trim() ? "No notes found." : "Type to search…"}</EmptyRow>
              ) : (
                results.notes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    style={noteCard}
                    onClick={openNote}
                    title="Open Notes"
                  >
                    <div style={cornerDot} />
                    <div style={noteTitle}>{n.title}</div>
                    <div style={notePreview}>{n.preview}</div>
                    <div style={noteLine} />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Files */}
        {showFiles && (
          <div style={{ marginBottom: 22 }}>
            {tab === "all" && <SectionTitle>Files</SectionTitle>}
            <div style={filesList}>
              {results.files.length === 0 ? (
                <EmptyRow>{q.trim() ? "No files found." : "Type to search…"}</EmptyRow>
              ) : (
                results.files.map((f) => (
                  <div key={f.id} style={fileRow}>
                    <div style={fileIcon}>📄</div>
                    <div style={{ flex: 1 }}>
                      <div style={fileName}>{f.name}</div>
                      <div style={fileMeta}>{(f.type || "file").toUpperCase()}</div>
                    </div>
                    <button type="button" style={smallBtn} onClick={() => openFile(f)}>
                      Open
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Folders */}
        {showFolders && (
          <div>
            <SectionTitle>Folders</SectionTitle>
            <div style={foldersGrid}>
              {results.folders.length === 0 ? (
                <EmptyRow>{q.trim() ? "No folders found." : "Type to search…"}</EmptyRow>
              ) : (
                results.folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    style={folderPill}
                    onClick={() => openFolder(f.id)}
                    title="Open Folder"
                  >
                    <div style={folderLeft}>
                      <span style={{ fontSize: 18 }}>📁</span>
                      <div>
                        <div style={folderName}>{f.name}</div>
                        <div style={folderCount}>{f.count} items</div>
                      </div>
                    </div>

                    <div style={dots}>•••</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...tabBtn,
        color: active ? "#f6a300" : "rgba(255,255,255,0.75)",
        borderBottom: active ? "2px solid #f6a300" : "2px solid transparent",
      }}
    >
      {label}
    </button>
  );
}

function SectionTitle({ children }) {
  return <div style={sectionTitle}>{children}</div>;
}

function EmptyRow({ children }) {
  return <div style={emptyRow}>{children}</div>;
}


const page = {
  width: "100%",
  minHeight: "calc(100vh - 110px)",
  padding: 18,
};

const topRow = { display: "flex", alignItems: "center", gap: 14 };
const topTitle = { color: "#fff", fontWeight: 900, fontSize: 14, width: 70, textTransform: "lowercase" };

const searchWrap = {
  flex: 1,
  maxWidth: 520,
  background: "#6a625a",
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  gap: 10,
  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
};
const searchIcon = { opacity: 0.9 };
const searchInput = { width: "100%", border: "none", outline: "none", background: "transparent", color: "#fff", fontWeight: 700, fontSize: 12 };

const profileBubble = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const tabs = { display: "flex", gap: 18, marginTop: 12, alignItems: "center" };
const tabBtn = { background: "transparent", border: "none", padding: "8px 2px", fontWeight: 900, fontSize: 12, cursor: "pointer" };

const sectionTitle = { color: "rgba(255,255,255,0.8)", fontWeight: 900, fontSize: 12, marginBottom: 10 };
const emptyRow = { color: "rgba(255,255,255,0.55)", fontSize: 12, padding: "10px 0" };

const notesGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 18, maxWidth: 520 };
const noteCard = { background: "#6a625a", border: "none", borderRadius: 6, padding: "14px 14px 12px", textAlign: "left", cursor: "pointer", minHeight: 110, position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.28)" };
const cornerDot = { position: "absolute", top: 10, right: 10, width: 10, height: 10, borderRadius: 2, background: "#f6a300" };
const noteTitle = { color: "#fff", fontWeight: 900, fontSize: 12, marginBottom: 6 };
const notePreview = { color: "rgba(255,255,255,0.75)", fontSize: 11, lineHeight: 1.3 };
const noteLine = { width: 38, height: 2, background: "rgba(255,255,255,0.35)", borderRadius: 999, marginTop: 10 };

const filesList = { display: "flex", flexDirection: "column", gap: 10, maxWidth: 700 };
const fileRow = { display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" };
const fileIcon = { width: 38, height: 38, borderRadius: 10, background: "rgba(246,163,0,0.12)", border: "1px solid rgba(246,163,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" };
const fileName = { color: "#fff", fontWeight: 900, fontSize: 12 };
const fileMeta = { color: "#9aa0a6", fontSize: 11 };
const smallBtn = { background: "#f6a300", color: "#111", borderRadius: 999, fontWeight: 900, padding: "8px 14px", border: "none", cursor: "pointer" };

const foldersGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, maxWidth: 620 };
const folderPill = { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", background: "#6a625a", border: "none", borderRadius: 999, cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.25)" };
const folderLeft = { display: "flex", alignItems: "center", gap: 10 };
const folderName = { color: "#fff", fontWeight: 900, fontSize: 12 };
const folderCount = { color: "rgba(255,255,255,0.7)", fontSize: 11 };
const dots = { color: "rgba(255,255,255,0.7)", letterSpacing: 2 };
