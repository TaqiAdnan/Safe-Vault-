import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";

export default function ChangePassword() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      return showAlert("Please fill all fields.", "error");
    }
    if (form.newPassword.length < 8) return showAlert("New password must be at least 8 characters.", "error");
    if (form.newPassword !== form.confirmNewPassword) return showAlert("New passwords do not match.", "error");

    try {
      setSaving(true);

      await api("/settings/password", {
        method: "PATCH",
        token,
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
      });

      showAlert("Password updated successfully!");
      setTimeout(() => {
        navigate("/vault/settings");
      }, 1500);
    } catch (err) {
      if (err.status === 401) return logout();
      showAlert(err.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", color: "white" }}>
      {/* Alert Popup */}
      {alert && (
        <div style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 18px",
          borderRadius: 8,
          background: alert.type === "error" ? "#ff5a5a" : "#f6a300",
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

      <h3 style={{ fontWeight: 900, color: "#f6a300" }}>Change Password</h3>

      <form onSubmit={onSubmit} className="d-flex flex-column gap-3" style={{ background: "#111", padding: 20, borderRadius: 12 }}>
        <input
          className="form-control"
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={onChange}
          placeholder="Current password"
          autoComplete="new-password"
        />

        <input
          className="form-control"
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={onChange}
          placeholder="New password"
          autoComplete="new-password"
        />

        <input
          className="form-control"
          type="password"
          name="confirmNewPassword"
          value={form.confirmNewPassword}
          onChange={onChange}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        <button className="btn" type="submit" disabled={saving} style={{ background: "#f6a300", fontWeight: 900 }}>
          {saving ? "SAVING..." : "UPDATE PASSWORD"}
        </button>

        <button className="btn" type="button" onClick={() => navigate("/vault/settings")} disabled={saving} style={{ background: "transparent", border: "1px solid #f6a300", color: "#f6a300", fontWeight: 900 }}>
          BACK
        </button>
      </form>
    </div>
  );
}