import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  const [step, setStep] = useState(1); // 1=email, 2=code+new pass
  const [email, setEmail] = useState("");

  // backend reset session
  const [resetToken, setResetToken] = useState(() => sessionStorage.getItem("reset_token") || "");
  const [meta, setMeta] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("reset_meta") || "null");
    } catch {
      return null;
    }
  });

  // code digits
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  // passwords
  const [pw, setPw] = useState({ newPassword: "", confirmPassword: "" });

  // simple inline error
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => inputsRef.current?.[0]?.focus?.(), 60);
    }
  }, [step]);

  // If refresh on step 2 but token missing, go back to step 1
  useEffect(() => {
    if (step === 2 && !resetToken) {
      setStep(1);
    }
  }, [step, resetToken]);

  const clearStep2 = () => {
    setDigits(["", "", "", "", "", ""]);
    setPw({ newPassword: "", confirmPassword: "" });
    setError("");
  };

  const sendCode = async () => {
    const em = email.trim().toLowerCase();
    if (!em) return alert(" enter your email address.");
  
    try {
      setLoading(true);
      setError("");
  
      const data = await api("/auth/forgot-password", {
        method: "POST",
        body: { email: em },
      });
  
      if (!data?.resetToken) {
        setError(data?.message || "No resetToken returned from server");
        return;
      }
  
      setResetToken(data.resetToken);
      setMeta(data.meta || null);
  
      sessionStorage.setItem("reset_token", data.resetToken);
      sessionStorage.setItem("reset_meta", JSON.stringify(data.meta || {}));
  
      setDigits(["", "", "", "", "", ""]);
      setPw({ newPassword: "", confirmPassword: "" });
  
      setStep(2);
    } catch (err) {
      if (err.code === "EMAIL_NOT_FOUND") return setError("Email not found.");
      if (err.code === "ACCOUNT_NOT_VERIFIED") return setError("Account not verified.");
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  const onChangeDigit = (idx, value) => {
    setError("");
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const onKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const onPaste = (e) => {
    setError("");
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const arr = text.split("");
    while (arr.length < 6) arr.push("");
    setDigits(arr);
    setTimeout(() => inputsRef.current[Math.min(text.length, 6) - 1]?.focus(), 0);
  };

  const resetPassword = async () => {
    const entered = digits.join("");
    if (entered.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    if (!pw.newPassword || !pw.confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (pw.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (pw.newPassword !== pw.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const token = resetToken || sessionStorage.getItem("reset_token");
    if (!token) {
      setError("Reset session expired. Please request a new code.");
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await api("/auth/forgot-password/reset", {
        method: "POST",
        token,
        body: {
          code: entered,
          newPassword: pw.newPassword,
        },
      });

      alert(data?.message || "Password updated. Please login.");
      sessionStorage.removeItem("reset_token");
      sessionStorage.removeItem("reset_meta");
      setResetToken("");
      setMeta(null);
      setDigits(["", "", "", "", "", ""]);
      setPw({ newPassword: "", confirmPassword: "" });
      setEmail("");

      navigate(data?.redirectTo || "/login", { replace: true });
    } catch (err) {
      if (err.code === "RESET_CODE_INVALID") {
        setError("Wrong code. Please try again.");
      } else if (err.code === "RESET_CODE_EXPIRED") {
        setError("Code expired. Please request a new code.");
      } else if (err.code === "NO_RESET_CODE") {
        setError("No reset code requested. Please send a new code.");
      } else if (err.status === 401) {
        setError("Reset session expired. Please request a new code.");
      } else {
        setError(err.message || "Reset failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setError("");
    clearStep2();
    setStep(1);
  };

  const resendCode = async () => {
    // just reuse sendCode
    await sendCode();
  };

  const expiresHint = meta?.expiresInSeconds
    ? `Code expires in ${Math.max(1, Math.floor(meta.expiresInSeconds / 60))} min.`
    : "";

  return (
    <AuthLayout titleLeft="SafeVault Directory" titleRight="RESET YOUR PASSWORD">
      <div className="row g-3">
        {/* Left bullets */}
        <div className="col-12 col-md-3">
          <ul style={{ color: "#d6d6d6", margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Unified</li>
            <li>High Security</li>
            <li>Mobile and Desktop</li>
          </ul>
        </div>

        {/* Center */}
        <div className="col-12 col-md-6 d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: 520 }}>
            <div className="text-center mb-2" style={{ color: "#f6a300", fontWeight: 900 }}>
              {step === 1 ? "FORGOT PASSWORD" : "ENTER CODE + NEW PASSWORD"}
            </div>

            <div style={grayCard}>
              {error && <div style={errorBox}>{error}</div>}

              {step === 1 ? (
                <>
                  <div style={descText}>Enter your email address and we will send a reset code.</div>

                  <div className="mt-3">
                    <div style={label}>EMAIL ADDRESS</div>
                    <input
                      className="form-control"
                      id="forgot-email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="enter email address"
                      style={inputStyle}
                      type="email"
                      autoComplete="new-email"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={loading}
                    />

                  </div>

                  <button className="btn w-100 mt-3" style={continueBtn} onClick={sendCode} disabled={loading}>
                    {loading ? "..." : "SEND RESET CODE"}
                  </button>

                  <div className="text-center mt-3" style={{ fontSize: 12 }}>
                    <Link to="/login" style={{ color: "#111", fontWeight: 800, textDecoration: "none" }}>
                      Back to Login
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div style={descText}>
                    We sent a reset code to:
                    <div style={{ fontWeight: 900 }}>{email}</div>
                    {expiresHint && <div style={{ fontSize: 12, fontWeight: 800, marginTop: 6 }}>{expiresHint}</div>}
                  </div>

                  {/* code boxes */}
                  <div className="d-flex justify-content-center gap-2 mt-3" onPaste={onPaste}>
                    {digits.map((d, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputsRef.current[idx] = el)}
                        value={d}
                        onChange={(e) => onChangeDigit(idx, e.target.value)}
                        onKeyDown={(e) => onKeyDown(idx, e)}
                        inputMode="numeric"
                        maxLength={1}
                        style={codeBox}
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <div className="row g-2 mt-3">
                    <div className="col-12">
                      <div style={label}>NEW PASSWORD</div>
                      <input
                        className="form-control"
                        type="password"
                        value={pw.newPassword}
                        onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                        placeholder="enter new password"
                        style={inputStyle}
                        disabled={loading}
                      />
                    </div>

                    <div className="col-12">
                      <div style={label}>CONFIRM PASSWORD</div>
                      <input
                        className="form-control"
                        type="password"
                        value={pw.confirmPassword}
                        onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })}
                        placeholder="confirm new password"
                        style={inputStyle}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button className="btn w-100 mt-3" style={continueBtn} onClick={resetPassword} disabled={loading}>
                    {loading ? "..." : "RESET PASSWORD"}
                  </button>

                  <div className="d-flex gap-2 mt-2">
                    <button className="btn w-100" style={ghostBtn} onClick={changeEmail} disabled={loading}>
                      CHANGE EMAIL
                    </button>
                    <button className="btn w-100" style={ghostBtn} onClick={resendCode} type="button" disabled={loading}>
                      RESEND CODE
                    </button>
                  </div>

                  <div className="text-center mt-3" style={{ fontSize: 12 }}>
                    <Link to="/login" style={{ color: "#111", fontWeight: 800, textDecoration: "none" }}>
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right icon */}
        <div className="col-12 col-md-3 d-flex justify-content-end align-items-start">
          <div style={iconBox} title="SafeVault" aria-label="SafeVault">
            ▣
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

/* styles */
const grayCard = {
  background: "#d9d9d9",
  borderRadius: 10,
  padding: 22,
  textAlign: "left",
};

const label = {
  color: "#111",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const descText = {
  color: "#111",
  fontSize: 12,
  fontWeight: 700,
  textAlign: "center",
};

const inputStyle = {
  background: "#6a625a",
  border: "none",
  color: "white",
  borderRadius: 12,
  height: 46,
};

const codeBox = {
  width: 42,
  height: 42,
  borderRadius: 8,
  border: "1px solid #bdbdbd",
  textAlign: "center",
  fontSize: 18,
  fontWeight: 900,
  outline: "none",
  background: "#cfcfcf",
};

const continueBtn = {
  background: "white",
  borderRadius: 999,
  fontWeight: 900,
  color: "#f6a300",
  border: "none",
  padding: "10px 16px",
};

const ghostBtn = {
  background: "transparent",
  borderRadius: 999,
  fontWeight: 900,
  color: "#111",
  border: "1px solid rgba(0,0,0,0.25)",
  padding: "10px 12px",
};

const iconBox = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: "#f6a300",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  color: "#111",
};

const errorBox = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.25)",
  color: "#7a0b0b",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 10,
  textAlign: "left",
};
