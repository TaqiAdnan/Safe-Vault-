import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function VerifyCode() {
  const navigate = useNavigate();

  const email = useMemo(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem("signup_step1") || "null");
      return s?.email || "user@email.com";
    } catch {
      return "user@email.com";
    }
  }, []);

  const meta = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("signup_meta") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");
  const [alert, setAlert] = useState(null);

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("signup_token");
    if (!token) navigate("/register/step1");

    if (meta?.devOtp) setHint(`DEV OTP: ${meta.devOtp}`);
  }, [navigate, meta]);

  const onChangeDigit = (idx, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const onKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const arr = text.split("");
    while (arr.length < 6) arr.push("");
    setDigits(arr);
  };

  const onContinue = async () => {
    const entered = digits.join("");
    if (entered.length !== 6) return showAlert("Please enter the 6-digit code.");

    const signupToken = sessionStorage.getItem("signup_token");
    if (!signupToken) {
      showAlert("Signup session missing. Please start again.");
      navigate("/register/step1");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/signup/verify", {
        method: "POST",
        token: signupToken,
        body: { code: entered },
      });

      localStorage.setItem("authToken", data.token);

      sessionStorage.removeItem("signup_token");
      sessionStorage.removeItem("signup_step1");
      sessionStorage.removeItem("signup_meta");

      navigate(data.redirectTo || "/vault");
    } catch (err) {
      if (err.code === "OTP_INVALID") {
        showAlert("Invalid code. Please try again.");
      } else {
        showAlert(err.message || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const onResend = () => {
    showAlert("To resend a new code, please go back to Step 2 and submit again.");
    navigate("/register/step2");
  };

  return (
    <AuthLayout titleLeft="SafeVault Directory" titleRight="VERIFY YOUR ACCOUNT">
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

      <div className="row g-3">
        <div className="col-12 col-md-3">
          <ul style={{ color: "#d6d6d6", margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Unified</li>
            <li>High Security</li>
            <li>Mobile and Desktop</li>
          </ul>
        </div>

        <div className="col-12 col-md-6 d-flex justify-content-center">
          <div className="w-100" style={{ maxWidth: 520 }}>
            <div className="text-center mb-2" style={{ color: "#f6a300", fontWeight: 900 }}>
              PLEASE ENTER YOUR CODE
            </div>

            <div style={grayCard}>
              <div className="text-center" style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>
                We have sent the code verification to your email
              </div>

              <div className="text-center mb-3" style={{ fontSize: 12, color: "#111" }}>
                <b>{email}</b>
              </div>

              <div className="d-flex justify-content-center mb-3">
                <div
                  style={{
                    width: 46,
                    height: 36,
                    borderRadius: 8,
                    background: "#f6a300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#111",
                  }}
                >
                  ✉
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mb-3" onPaste={onPaste}>
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
                  />
                ))}
              </div>

              <button className="btn w-100" style={continueBtn} onClick={onContinue} disabled={loading}>
                {loading ? "VERIFYING..." : "CONTINUE"}
              </button>

              <button className="btn w-100 mt-2" style={resendBtn} onClick={onResend} type="button" disabled={loading}>
                RESEND CODE
              </button>

              {hint ? (
                <div className="text-center mt-2" style={{ fontSize: 11, color: "#333" }}>
                  {hint}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3" />
      </div>
    </AuthLayout>
  );
}

const grayCard = { background: "#d9d9d9", borderRadius: 8, padding: 22, textAlign: "center" };
const codeBox = {
  width: 40,
  height: 40,
  borderRadius: 6,
  border: "1px solid #bdbdbd",
  textAlign: "center",
  fontSize: 18,
  fontWeight: 800,
  outline: "none",
  background: "#cfcfcf",
};
const continueBtn = { background: "white", borderRadius: 999, fontWeight: 900, color: "#f6a300", border: "none", padding: "10px 16px" };
const resendBtn = { background: "transparent", border: "none", color: "#111", fontWeight: 800, fontSize: 12 };