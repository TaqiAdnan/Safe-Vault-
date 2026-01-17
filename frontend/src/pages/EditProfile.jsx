import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";

export default function EditProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState([]); // array of strings (fixed keys)
  const [initial, setInitial] = useState({ fullName: "", email: "" });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const hardLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const load = async () => {
      if (!token) return hardLogout();

      try {
        setLoading(true);

        const [me, q] = await Promise.all([
          api("/settings/me", { token }),
          api("/settings/security-questions"), // public
        ]);

        const list = Array.isArray(q) ? q : q.questions || q.data || [];
        setQuestions(Array.isArray(list) ? list : []);

        setInitial({ fullName: me.fullName || "", email: me.email || "" });

        setForm((prev) => ({
          ...prev,
          fullName: me.fullName || "",
          email: me.email || "",
          securityQuestion: me.securityQuestion || "",
          securityAnswer: "",
        }));
      } catch (err) {
        if (err.status === 401) return hardLogout();
        alert(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const labelForQuestion = (key) => {
    if (key === "pet") return "What is your first pet’s name?";
    if (key === "city") return "In what city were you born?";
    if (key === "school") return "What is the name of your first school?";
    return key; // fallback
  };

  const onSave = async (e) => {
    e.preventDefault();

    if (!form.fullName.trim() || !form.email.trim()) {
      return alert("Please fill full name and email.");
    }

    if (form.securityQuestion && !form.securityAnswer.trim()) {
      return alert("Please enter the security answer.");
    }

    try {
      setSaving(true);

      // 1) update profile if changed
      const patchMe = {};
      if (form.fullName.trim() !== initial.fullName) patchMe.fullName = form.fullName.trim();
      if (form.email.trim().toLowerCase() !== initial.email.toLowerCase()) patchMe.email = form.email.trim();

      if (Object.keys(patchMe).length) {
        await api("/settings/me", { method: "PATCH", token, body: patchMe });
      }

      // 2) update security question if provided
      if (form.securityQuestion) {
        await api("/settings/security-question", {
          method: "PATCH",
          token,
          body: {
            question: form.securityQuestion,
            answer: form.securityAnswer.trim(),
          },
        });
      }

      alert("Updated successfully.");
      navigate("/vault/settings");
    } catch (err) {
      if (err.status === 401) return hardLogout();
      if (err.status === 409) return alert("Email already in use.");
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ color: "#d6d6d6", fontWeight: 800 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={panel}>
        <div style={panelHeader}>
          <div>
            <div style={panelTitle}>Edit Information</div>
            <div style={panelSub}>Update your account details and security question.</div>
          </div>

          <button className="btn" style={pillGhost} onClick={() => navigate("/vault/settings")} disabled={saving}>
            Cancel
          </button>
        </div>

        <div style={card}>
          <form onSubmit={onSave} className="row g-4">
            <div className="col-12">
              <div style={sectionTitle}>Profile</div>
            </div>

            <div className="col-12 col-md-6">
              <Label>FULL NAME</Label>
              <input
                className="form-control"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="Your full name"
                style={inputStyle}
                disabled={saving}
              />
            </div>

            <div className="col-12 col-md-6">
              <Label>EMAIL ADDRESS</Label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Your email"
                style={inputStyle}
                disabled={saving}
              />
            </div>

            <div className="col-12 mt-2">
              <div style={sectionTitle}>Security</div>
              <div style={smallHint}>
                Select a fixed security question (from backend) and set a new answer.
              </div>
            </div>

            <div className="col-12 col-md-6">
              <Label>SECURITY QUESTION</Label>
              <select
                className="form-select"
                name="securityQuestion"
                value={form.securityQuestion}
                onChange={onChange}
                style={inputStyle}
                disabled={saving}
              >
                <option value="">Choose a question</option>
                {(questions.length ? questions : ["pet", "city", "school"]).map((q) => (
                  <option key={q} value={q}>
                    {labelForQuestion(q)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <Label>SECURITY ANSWER</Label>
              <input
                className="form-control"
                name="securityAnswer"
                value={form.securityAnswer}
                onChange={onChange}
                placeholder="Enter new answer"
                style={inputStyle}
                disabled={saving}
              />
            </div>

            <div className="col-12 d-flex flex-column flex-md-row gap-3 mt-2">
              <button className="btn" type="submit" style={pillPrimary} disabled={saving}>
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>

              <button
                className="btn"
                type="button"
                style={pillGhost}
                onClick={() => navigate("/vault/settings")}
                disabled={saving}
              >
                BACK
              </button>
            </div>

            <div className="col-12" style={footNote}>
              Note: Security answers are hashed on the backend.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ color: "#d6d6d6", fontWeight: 800, fontSize: 12, marginBottom: 6 }}>{children}</div>;
}

/* ===== Styles ===== */
const pageWrap = {
  width: "100%",
  minHeight: "calc(100vh - 120px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const panel = {
  width: "100%",
  maxWidth: 1120,
  padding: 22,
  borderRadius: 18,
  background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
};

const panelHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 16,
};

const panelTitle = { color: "#fff", fontWeight: 900, fontSize: 18 };
const panelSub = { color: "#9aa0a6", fontSize: 12, marginTop: 2 };

const card = {
  width: "100%",
  background: "#111",
  borderRadius: 16,
  padding: 22,
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const inputStyle = {
  background: "#6a625a",
  border: "none",
  color: "white",
  borderRadius: 10,
  height: 42,
};

const sectionTitle = {
  color: "#f6a300",
  fontWeight: 900,
  marginBottom: 4,
};

const smallHint = {
  color: "#bdbdbd",
  fontSize: 12,
};

const pillPrimary = {
  background: "#f6a300",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "none",
};

const pillGhost = {
  background: "transparent",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "1px solid rgba(246,163,0,0.45)",
};

const footNote = {
  marginTop: 8,
  color: "#bdbdbd",
  fontSize: 12,
  lineHeight: 1.6,
};
