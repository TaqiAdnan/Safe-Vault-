import { useEffect, useMemo, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Notes() {

  const getToken = () =>
    localStorage.getItem("authToken") || localStorage.getItem("token") || "";

  const api = async (path, { method = "GET", body } = {}) => {
    const token = getToken();
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

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { message: '' }
  const [dialog, setDialog] = useState(null); // { type: 'confirm', title, message, onConfirm, onCancel }

  // Modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [activeId, setActiveId] = useState(null);

  // Editor fields
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await api("/notes");
        // expected: { data: [{id,title,content,updatedAt}] }
        const list = r?.data || [];
        setNotes(
          list.map((n) => ({
            id: n.id,
            title: n.title || "",
            content: n.content || "",
            updatedAt: n.updatedAt ? new Date(n.updatedAt).getTime() : Date.now(),
          }))
        );
      } catch (e) {
        // fallback to demo to keep UI working during backend dev
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) || null,
    [notes, activeId]
  );

  const openNote = (note) => {
    setActiveId(note.id);
    setDraftTitle(note.title);
    setDraftContent(note.content);
    setMode("view");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setActiveId(null);
    setMode("view");
    setDraftTitle("");
    setDraftContent("");
  };

  const startEdit = () => {
    if (!activeNote) return;
    setMode("edit");
  };

  const save = async () => {
    const t = draftTitle.trim();
    const c = draftContent.trim();

    if (!t) return;

    try {
      
      const r = await api(`/notes/${activeId}`, {
        method: "PATCH",
        body: { title: t, content: c },
      });

      const updated = r?.data || { id: activeId, title: t, content: c, updatedAt: Date.now() };

      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeId
            ? {
                ...n,
                title: updated.title ?? t,
                content: updated.content ?? c,
                updatedAt: updated.updatedAt ? new Date(updated.updatedAt).getTime() : Date.now(),
              }
            : n
        )
      );

      setMode("view");
      showAlert("Note saved successfully!");
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async () => {
    if (!activeId) return;

    setDialog({
      type: 'confirm',
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      subMessage: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
      onConfirm: async () => {
        setDialog(null);
        try {
          await api(`/notes/${activeId}`, { method: "DELETE" });
          setNotes((prev) => prev.filter((n) => n.id !== activeId));
          closeModal();
          showAlert("Note deleted successfully!");
        } catch (e) {
          alert(e.message);
        }
      },
      onCancel: () => setDialog(null)
    });
  };

  const addNew = async () => {
    try {
      
      const r = await api("/notes", {
        method: "POST",
        body: { title: "New note", content: "" },
      });

      const created = r?.data || {
        id: `n_${Date.now()}`,
        title: "New note",
        content: "",
        updatedAt: Date.now(),
      };

      setNotes((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.title || "New note",
          content: created.content || "",
          updatedAt: created.updatedAt ? new Date(created.updatedAt).getTime() : Date.now(),
        },
      ]);

      // open it directly in edit mode
      setActiveId(created.id);
      setDraftTitle(created.title || "New note");
      setDraftContent(created.content || "");
      setMode("edit");
      setOpen(true);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={page}>
      {/* Alert Popup */}
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
          zIndex: 10000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center"
        }}>
          {alert.message}
        </div>
      )}

      {/* Dialog Overlay */}
      {dialog && (
        <div style={dialogOverlay} onClick={() => dialog.onCancel?.()}>
          <div style={dialogBox} onClick={(e) => e.stopPropagation()}>
            <div style={dialogHeader}>
              <h3 style={dialogTitle}>{dialog.title}</h3>
            </div>

            <div style={dialogBody}>
              <p style={dialogMessage}>{dialog.message}</p>
              {dialog.subMessage && (
                <p style={dialogSubMessage}>{dialog.subMessage}</p>
              )}
            </div>

            <div style={dialogFooter}>
              <button
                style={btnSecondary}
                onClick={() => dialog.onCancel?.()}
              >
                {dialog.cancelText || 'Cancel'}
              </button>
              
              <button
                style={dialog.danger ? btnDangerDialog : btnPrimary}
                onClick={() => dialog.onConfirm()}
              >
                {dialog.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header row (like "Notes ˅") */}
      <div style={topRow}>
        <div style={topLeft}>
          <div style={topTitle}>Notes</div>
          {loading && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Loading…</div>}
        </div>

        
      </div>

      {/* Notes grid */}
      <div style={grid}>
        {notes.map((n) => (
          <button key={n.id} style={noteCard} onClick={() => openNote(n)} type="button">
            <div style={cornerDot} />
            <div style={noteTitle}>{n.title}</div>
            <div style={notePreview}>{preview(n.content)}</div>
            <div style={noteLine} />
          </button>
        ))}
      </div>

      {/* Floating + button */}
      <button style={fab} onClick={addNew} type="button" aria-label="Add note" title="Add note">
        +
      </button>

      {/* Modal */}
      {open && (
        <div style={overlay} onClick={closeModal}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div style={modalTop}>
              <div>
                <div style={modalTitle}>{mode === "edit" ? "Edit Note" : "Note"}</div>
                <div style={modalSub}>
                  {mode === "edit" ? "Update your note and save changes." : "View your note content."}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {mode === "view" && (
                  <button style={btnOutline} onClick={startEdit} type="button">
                    Edit
                  </button>
                )}
                <button style={btnGhost} onClick={closeModal} type="button">
                  Close
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={modalBody}>
              <div style={label}>TITLE</div>
              <input
                style={{ ...input, opacity: mode === "view" ? 0.85 : 1 }}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                disabled={mode === "view"}
              />

              <div style={{ height: 14 }} />

              <div style={label}>CONTENT</div>
              <textarea
                style={{ ...textarea, opacity: mode === "view" ? 0.85 : 1 }}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                disabled={mode === "view"}
                placeholder="Write your note here..."
              />

              {/* Actions */}
              <div style={actions}>
                <button style={btnDanger} onClick={remove} type="button">
                  Delete
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  {mode === "edit" ? (
                    <>
                      <button style={btnGhost} onClick={() => setMode("view")} type="button">
                        Cancel
                      </button>
                      <button
                        style={{
                          ...btnPrimary,
                          opacity: draftTitle.trim() ? 1 : 0.6,
                        }}
                        onClick={save}
                        disabled={!draftTitle.trim()}
                        type="button"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button style={btnPrimary} onClick={closeModal} type="button">
                      Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helpers */
function preview(text) {
  const clean = (text || "").replace(/\n/g, " ").trim();
  if (!clean) return "—";
  return clean.length > 28 ? clean.slice(0, 28) + "..." : clean;
}


const page = {
  width: "100%",
  minHeight: "calc(100vh - 110px)",
  padding: 18,
  position: "relative",
};

const topRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 18,
};

const topLeft = { display: "flex", alignItems: "center", gap: 10 };
const topTitle = { color: "#fff", fontWeight: 900, fontSize: 16 };
const caret = { color: "rgba(255,255,255,0.6)", fontSize: 18, transform: "translateY(-1px)" };

const topRightIcon = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 18,
  maxWidth: 720,
  margin: "0 auto",
  paddingTop: 10,
};

const noteCard = {
  background: "#6a625a",
  border: "none",
  borderRadius: 6,
  padding: "14px 14px 12px",
  textAlign: "left",
  cursor: "pointer",
  minHeight: 110,
  position: "relative",
  boxShadow: "0 10px 25px rgba(0,0,0,0.28)",
};

const cornerDot = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 10,
  height: 10,
  borderRadius: 2,
  background: "#f6a300",
};

const noteTitle = { color: "#fff", fontWeight: 900, fontSize: 12, marginBottom: 6 };
const notePreview = { color: "rgba(255,255,255,0.75)", fontSize: 11, lineHeight: 1.3 };
const noteLine = {
  width: 38,
  height: 2,
  background: "rgba(255,255,255,0.35)",
  borderRadius: 999,
  marginTop: 10,
};

const fab = {
  position: "fixed",
  right: 26,
  bottom: 26,
  width: 64,
  height: 64,
  borderRadius: "50%",
  background: "#f6a300",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  fontSize: 34,
  lineHeight: "64px",
  textAlign: "center",
  boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
  cursor: "pointer",
};

/* Modal */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 9999,
};

const modal = {
  width: "100%",
  maxWidth: 760,
  background: "#111",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  overflow: "hidden",
};

const modalTop = {
  padding: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
};

const modalTitle = { color: "#fff", fontWeight: 900, fontSize: 16 };
const modalSub = { color: "#9aa0a6", fontSize: 12, marginTop: 2 };

const modalBody = { padding: 16 };

const label = { color: "#d6d6d6", fontSize: 12, fontWeight: 900, marginBottom: 8 };

const input = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "none",
  outline: "none",
  background: "#6a625a",
  color: "#fff",
  padding: "0 12px",
};

const textarea = {
  width: "100%",
  minHeight: 240,
  borderRadius: 10,
  border: "none",
  outline: "none",
  background: "#6a625a",
  color: "#fff",
  padding: 12,
  resize: "vertical",
};

const actions = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 14,
  gap: 10,
  flexWrap: "wrap",
};

const btnPrimary = {
  background: "#f6a300",
  border: "none",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
  cursor: "pointer",
};

const btnGhost = {
  background: "transparent",
  border: "1px solid rgba(246,163,0,0.35)",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
  cursor: "pointer",
};

const btnOutline = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
  cursor: "pointer",
};

const btnDanger = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
  cursor: "pointer",
};

// Dialog styles
const dialogOverlay = {
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
  margin: "-8px 0 0 0",
  color: "#9ca3af",
  fontSize: 13,
  lineHeight: 1.4
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

const btnDangerDialog = {
  background: "#ef4444",
  border: "none",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 700,
  padding: "10px 20px",
  cursor: "pointer",
  fontSize: 14
};