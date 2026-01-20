import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function VerifyMfa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 6 digits like your style
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const mfaTempToken = sessionStorage.getItem("mfa_temp") || "";

  useEffect(() => {
    // If user opened page without token => back to login
    if (!mfaTempToken) navigate("/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const code = digits.join("");

  const onChangeDigit = (idx, value) => {
    const v = String(value || "").replace(/\D/g, "").slice(-1); // only last digit
    setDigits((prev) => {
      const copy = [...prev];
      copy[idx] = v;
      return copy;
    });

    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const onKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        // clear current
        setDigits((prev) => {
          const copy = [...prev];
          copy[idx] = "";
          return copy;
        });
        return;
      }
      // move back
      if (idx > 0) inputsRef.current[idx - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const onPaste = (e) => {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (text.length !== 6) return;
    setDigits(text.split(""));
    inputsRef.current[5]?.focus();
  };

  const hardReset = () => {
    sessionStorage.removeItem("mfa_temp");
    navigate("/login");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      alert("Enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/mfa/verify-login", {
        method: "POST",
        token: mfaTempToken,
        body: { code },
      });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        sessionStorage.removeItem("mfa_temp");
        navigate(data.redirectTo || "/vault");
        return;
      }

      alert(data.message || "Verification failed");
    } catch (err) {
      if (err.code === "TOKEN_EXPIRED" || err.status === 401) {
        alert("Session expired. Please login again.");
        return hardReset();
      }
      alert(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout titleLeft="SafeVault Directory" titleRight="MFA VERIFICATION">
      <div className="row g-3 align-items-start">
        <div className="col-12 col-md-4">
          <div style={{ color: "#d6d6d6", lineHeight: 1.8 }}>
            Open <b>Google Authenticator</b> and enter the 6-digit code.
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: "#9aa0a6" }}>
            Tip: The code changes every 30 seconds.
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn" style={pillGhost} onClick={hardReset} disabled={loading}>
              Back to Login
            </button>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <h6 className="text-center mb-4" style={{ color: "#f6a300", fontWeight: 800 }}>
            ENTER YOUR AUTHENTICATOR CODE
          </h6>

          <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }} onPaste={onPaste}>
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  value={d}
                  onChange={(e) => onChangeDigit(idx, e.target.value)}
                  onKeyDown={(e) => onKeyDown(idx, e)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  style={digitBox}
                />
              ))}
            </div>

            <button type="submit" className="btn" style={pillBtn} disabled={loading}>
              {loading ? "VERIFYING..." : "VERIFY"}
            </button>

            <div className="text-center" style={{ color: "#9aa0a6", fontSize: 12 }}>
              Having trouble?{" "}
              <Link to="/help" style={{ color: "#f6a300", fontWeight: 800, textDecoration: "none" }}>
                Help Center
              </Link>
            </div>
          </form>
        </div>

        <div className="col-12 col-md-3 d-flex justify-content-end align-items-start">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#f6a300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#111",
            }}
            title="SafeVault"
            aria-label="SafeVault"
          >
            ▣
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

const digitBox = {
  width: 44,
  height: 52,
  borderRadius: 10,
  border: "none",
  background: "#6a625a",
  color: "#fff",
  textAlign: "center",
  fontSize: 20,
  fontWeight: 900,
  outline: "none",
};

const pillBtn = {
  background: "#f6a300",
  color: "#111",
  borderRadius: 999,
  fontWeight: 800,
  padding: "10px 18px",
  border: "none",
};

const pillGhost = {
  background: "transparent",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 14px",
  border: "1px solid rgba(246,163,0,0.45)",
};
