import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [alert, setAlert] = useState(null);

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    showAlert("Message sent (demo).");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div style={page}>
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

      <div style={card}>
        <div style={title}>Contact Us</div>
        <div style={sub}>Send us a message and we'll get back to you.</div>

        <form onSubmit={submit} style={formWrap}>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={label}>NAME</div>
              <input style={input} value={form.name} onChange={onChange("name")} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={label}>EMAIL</div>
              <input style={input} value={form.email} onChange={onChange("email")} />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={label}>MESSAGE</div>
            <textarea style={textarea} value={form.message} onChange={onChange("message")} />
          </div>

          <div style={actions}>
            <button type="submit" style={{ ...btn, opacity: canSend(form) ? 1 : 0.6 }} disabled={!canSend(form)}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function canSend(f) {
  return f.name.trim() && f.email.trim() && f.message.trim();
}

const page = { minHeight: "calc(100vh - 80px)", padding: 24, display: "flex", justifyContent: "center" };

const card = {
  width: "100%",
  maxWidth: 900,
  background: "#0f0f0f",
  borderRadius: 16,
  border: "1px solid rgba(246,163,0,0.25)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  padding: 22,
};

const title = { color: "#f6a300", fontWeight: 900, fontSize: 22, marginBottom: 8 };
const sub = { color: "rgba(255,255,255,0.65)", fontSize: 13, marginBottom: 16 };

const formWrap = { marginTop: 8 };
const row = { display: "flex", gap: 12, flexWrap: "wrap" };
const label = { color: "#d6d6d6", fontWeight: 900, fontSize: 12, marginBottom: 8 };

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
  minHeight: 160,
  borderRadius: 10,
  border: "none",
  outline: "none",
  background: "#6a625a",
  color: "#fff",
  padding: 12,
  resize: "vertical",
};

const actions = { marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" };

const btn = {
  background: "#f6a300",
  border: "none",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 16px",
  cursor: "pointer",
};

const hint = { color: "rgba(255,255,255,0.55)", fontSize: 12 };