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

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmNewPassword) {
      return alert("Please fill all fields.");
    }
    if (form.newPassword.length < 8) return alert("New password must be at least 8 characters.");
    if (form.newPassword !== form.confirmNewPassword) return alert("New passwords do not match.");

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

      alert("Password updated successfully.");
      navigate("/vault/settings");
    } catch (err) {
      if (err.status === 401) return logout();
      alert(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", color: "white" }}>
      <h3 style={{ fontWeight: 900, color: "#f6a300" }}>Change Password</h3>

      <form onSubmit={onSubmit} className="d-flex flex-column gap-3" style={{ background: "#111", padding: 20, borderRadius: 12 }}>
        <input
          className="form-control"
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={onChange}
          placeholder="Current password"
        />

        <input
          className="form-control"
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={onChange}
          placeholder="New password"
        />

        <input
          className="form-control"
          type="password"
          name="confirmNewPassword"
          value={form.confirmNewPassword}
          onChange={onChange}
          placeholder="Confirm new password"
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
