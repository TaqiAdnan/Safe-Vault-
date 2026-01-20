import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/http";

export default function EnableMfa() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 
  const [qr, setQr] = useState({ qrDataUrl: "", otpauthUrl: "" });
  const [code, setCode] = useState("");

  const hardLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!token) return hardLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSetup = async () => {
    try {
      setLoading(true);
      const data = await api("/auth/mfa/setup", { method: "POST", token });
      setQr({ qrDataUrl: data.qrDataUrl || "", otpauthUrl: data.otpauthUrl || "" });
      setStep(2);
    } catch (err) {
      if (err.status === 401) return hardLogout();
      alert(err.message || "Failed to setup MFA");
    } finally {
      setLoading(false);
    }
  };

  const enable = async (e) => {
    e.preventDefault();

    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length !== 6) {
      alert("Enter a 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const data = await api("/auth/mfa/enable", {
        method: "POST",
        token,
        body: { code: clean },
      });

      alert(data.message || "MFA enabled");
      navigate("/vault/settings");
    } catch (err) {
      if (err.status === 401) return hardLogout();
      alert(err.message || "Enable MFA failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={panel}>
        <div style={headerRow}>
          <div>
            <div style={title}>Enable Multi-Factor Authentication</div>
            <div style={sub}>Use Google Authenticator to add an extra layer of protection.</div>
          </div>

          <Link to="/vault/settings" className="btn" style={pillGhost}>
            Back
          </Link>
        </div>

        <div style={card}>
          {step === 1 && (
            <div>
              <div style={boxTitle}>Step 1 — Generate QR</div>
              <div style={text}>
                When you click “Generate QR”, we will create a secret for your account.
                Then open <b>Google Authenticator</b> → tap <b>+</b> → <b>Scan a QR code</b>.
              </div>

              <button className="btn" style={pillPrimary} onClick={startSetup} disabled={loading}>
                {loading ? "GENERATING..." : "GENERATE QR"}
              </button>

              <div style={hint}>
                Note: Don’t share your QR. Anyone who has it can generate codes.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="row g-4 align-items-start">
              <div className="col-12 col-md-6">
                <div style={boxTitle}>Step 2 — Scan QR</div>

                {qr.qrDataUrl ? (
                  <div style={qrBox}>
                    <img
                      src={qr.qrDataUrl}
                      alt="MFA QR"
                      style={{ width: 220, height: 220, borderRadius: 14 }}
                    />
                  </div>
                ) : (
                  <div style={text}>QR not available. Go back and generate again.</div>
                )}

                <div style={hint}>
                  Open Google Authenticator → Add → Scan QR.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div style={boxTitle}>Step 3 — Verify Code</div>
                <div style={text}>Enter the 6-digit code shown in Google Authenticator.</div>

                <form onSubmit={enable} className="d-flex flex-column gap-3">
                  <input
                    className="form-control"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    style={inputStyle}
                  />

                  <button className="btn" style={pillPrimary} type="submit" disabled={loading}>
                    {loading ? "VERIFYING..." : "ENABLE MFA"}
                  </button>

                  <button
                    className="btn"
                    type="button"
                    style={pillDangerGhost}
                    disabled={loading}
                    onClick={() => {
                      setStep(1);
                      setQr({ qrDataUrl: "", otpauthUrl: "" });
                      setCode("");
                    }}
                  >
                    RESTART SETUP
                  </button>
                </form>

                <div style={hint}>
                  If the code keeps failing, wait for the next code (it changes every 30 seconds).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== styles ===== */
const pageWrap = { width: "100%", minHeight: "calc(100vh - 120px)", display: "flex", justifyContent: "center", alignItems: "center" };
const panel = { width: "100%", maxWidth: 960, padding: 22, borderRadius: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" };
const headerRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 };
const title = { color: "#fff", fontWeight: 900, fontSize: 18 };
const sub = { color: "#9aa0a6", fontSize: 12, marginTop: 2 };
const card = { width: "100%", background: "#111", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" };
const boxTitle = { color: "#f6a300", fontWeight: 900, marginBottom: 10 };
const text = { color: "#d6d6d6", fontSize: 13, lineHeight: 1.7, marginBottom: 14 };
const hint = { marginTop: 14, color: "#bdbdbd", fontSize: 12, lineHeight: 1.6, background: "rgba(246,163,0,0.08)", border: "1px solid rgba(246,163,0,0.2)", padding: "8px 10px", borderRadius: 12 };
const qrBox = { display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16 };
const inputStyle = { background: "#6a625a", border: "none", color: "white", borderRadius: 10, height: 44, fontWeight: 900, textAlign: "center", letterSpacing: 4 };
const pillPrimary = { background: "#f6a300", color: "#111", borderRadius: 999, fontWeight: 900, padding: "10px 14px", border: "none" };
const pillGhost = { background: "transparent", color: "#f6a300", borderRadius: 999, fontWeight: 900, padding: "10px 14px", border: "1px solid rgba(246,163,0,0.45)", textDecoration: "none" };
const pillDangerGhost = { background: "transparent", color: "#ffb4b4", borderRadius: 999, fontWeight: 900, padding: "10px 14px", border: "1px solid rgba(239,68,68,0.35)" };
