// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState({
    fullName: "",
    email: "",
    status: "",
    isVerified: false,
    securityQuestion: null,
    hasSecurityAnswer: false,
    mfaEnabled: false,
  });

  const token = localStorage.getItem("authToken");

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
        const data = await api("/settings/me", { token });
        setMe({
          fullName: data.fullName || "",
          email: data.email || "",
          status: data.status || "",
          isVerified: !!data.isVerified,
          securityQuestion: data.securityQuestion ?? null,
          hasSecurityAnswer: !!data.hasSecurityAnswer,
          mfaEnabled: !!data.mfaEnabled,
        });
      } catch (err) {
        if (err.status === 401) return hardLogout();
        alert(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    load();
    
  }, []);

  const onDevices = () => navigate("/vault/devices");

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
            <div style={panelTitle}>Account Settings</div>
            <div style={panelSub}>Manage your profile and trusted devices</div>
          </div>

          <div style={statusPill}>
            {me.isVerified ? "Verified" : "Not Verified"} · {me.status || "—"}
          </div>
        </div>

        <div style={accountCard}>
          <div className="row g-4 align-items-stretch">
            <div className="col-12 col-lg-8">
              <div style={{ color: "#f6a300", fontWeight: 900, fontSize: 18, marginBottom: 14 }}>
                My <span style={{ color: "#fff" }}>ACCOUNT</span>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <Label>FULL NAME</Label>
                  <input className="form-control" value={me.fullName} style={inputStyle} disabled />
                </div>

                <div className="col-12 col-md-4">
                  <Label>EMAIL ADDRESS</Label>
                  <input className="form-control" value={me.email} style={inputStyle} disabled />
                </div>

                <div className="col-12 col-md-4">
                  <Label>PASSWORD</Label>
                  <input className="form-control" value={"************"} style={inputStyle} disabled />
                </div>
              </div>

              <div className="d-flex flex-column flex-md-row gap-3 mt-5">
                <button className="btn" style={pillBtn} onClick={() => navigate("/vault/privacy")}>
                  PRIVACY POLICY
                </button>

                <button className="btn" style={pillBtn} onClick={() => navigate("/vault/edit-profile")}>
                  EDIT INFORMATION
                </button>

                <button className="btn" style={pillBtn} onClick={onDevices}>
                  SHOW YOUR DEVICES
                </button>

                
              </div>


              <div className="d-flex flex-column flex-md-row gap-3 mt-5">
              <button className="btn" style={pillBtn} onClick={() => navigate("/vault/change-password")}>
                  CHANGE PASSWORD
                </button>

                {me.mfaEnabled ? (
                <button
                  className="btn"
                  style={{ ...pillBtn, background: "#ff4d4d", color: "#fff" }}
                  onClick={async () => {
                    if (!confirm("Disable MFA?")) return;

                    try {
                      await api("/auth/mfa/disable", { method: "POST", token });
                      setMe((prev) => ({ ...prev, mfaEnabled: false }));
                      alert("MFA disabled");
                    } catch (err) {
                      if (err.status === 401) return hardLogout();
                      alert(err.message || "Failed to disable MFA");
                    }
                  }}
                >
                  DISABLE MFA
                </button>
              ) : (
                <button className="btn" style={pillBtn} onClick={() => navigate("/vault/mfa")}>
                  ENABLE MFA
                </button>
              )}


              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div style={rightCol}>
                <div style={profileCircle} aria-label="profile">
                  <div style={avatarDot} />
                  <div style={avatarBody} />
                </div>

                <div style={{ marginTop: 14, textAlign: "center" }}>
                  <div style={{ color: "#d6d6d6", fontWeight: 800 }}>{me.fullName || "User"}</div>
                  <div style={{ color: "#9aa0a6", fontSize: 12 }}>{me.email || "email@example.com"}</div>
                </div>

                <div style={hintBox}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Security Question</div>
                  <div style={{ fontSize: 12 }}>
                    {me.securityQuestion ? me.securityQuestion : "Not set"}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                    {me.hasSecurityAnswer ? "Answer: Set" : "Answer: Not set"}
                  </div>
                </div>

                <button className="btn mt-3" style={{ ...pillBtn, minWidth: 0 }} onClick={hardLogout}>
                  LOG OUT
                </button>

                

              </div>
            </div>
          </div>
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
  marginBottom: 16,
};

const panelTitle = { color: "#fff", fontWeight: 900, fontSize: 18 };
const panelSub = { color: "#9aa0a6", fontSize: 12, marginTop: 2 };

const statusPill = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(246,163,0,0.12)",
  border: "1px solid rgba(246,163,0,0.25)",
  color: "#f6a300",
  fontWeight: 900,
  fontSize: 12,
};

const accountCard = {
  position: "relative",
  width: "100%",
  background: "#111",
  borderRadius: 16,
  padding: 26,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const inputStyle = {
  background: "#6a625a",
  border: "none",
  color: "white",
  borderRadius: 10,
  height: 42,
};

const pillBtn = {
  background: "#ffffff",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "none",
  minWidth: 180,
};

const rightCol = {
  height: "100%",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const profileCircle = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  background: "#0b0b0b",
  border: "2px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const avatarDot = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "#f6a300",
  marginBottom: 6,
};

const avatarBody = {
  width: 56,
  height: 32,
  borderRadius: 20,
  background: "#f6a300",
  opacity: 0.9,
};

const hintBox = {
  marginTop: 14,
  fontSize: 12,
  color: "#d6d6d6",
  background: "rgba(246,163,0,0.10)",
  border: "1px solid rgba(246,163,0,0.22)",
  borderRadius: 12,
  padding: 12,
  textAlign: "center",
};
