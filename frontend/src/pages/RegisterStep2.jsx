import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function RegisterStep2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [step1, setStep1] = useState(null);

  const [form, setForm] = useState({
    option: "",
    securityQuestion: "",
    securityAnswer: "",
    acceptTerms: false,
  });

  const [alert, setAlert] = useState(null);

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("signup_token");
    const saved = sessionStorage.getItem("signup_step1");
    if (!token || !saved) {
      navigate("/register/step1");
      return;
    }
    setStep1(JSON.parse(saved));
  }, [navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onToggle = (e) => setForm({ ...form, acceptTerms: e.target.checked });

  const onSignup = async (e) => {
    e.preventDefault();

    if ( !form.securityQuestion || !form.securityAnswer) {
      showAlert("Please complete all fields.");
      return;
    }
    if (!form.acceptTerms) {
      showAlert("Please accept Terms & Conditions.");
      return;
    }

    const signupToken = sessionStorage.getItem("signup_token");
    if (!signupToken) {
      navigate("/register/step1");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/signup/step2", {
        method: "POST",
        token: signupToken,
        body: {
          securityQuestion: form.securityQuestion,
          securityAnswer: form.securityAnswer,
        },
      });

      sessionStorage.setItem("signup_token", data.signupToken);

      sessionStorage.setItem("signup_meta", JSON.stringify(data.meta || {}));

      navigate("/verify-code");
    } catch (err) {
      showAlert(err.message || "Signup step 2 failed");
    } finally {
      setLoading(false);
    }
  };

  if (!step1) return null;

  return (
    <AuthLayout titleLeft="SafeVault Directory" titleRight="BECOME A MEMBER NOW!">
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

        <div className="col-12 col-md-6">
          <h6 className="text-center mb-3" style={{ color: "#f6a300", fontWeight: 800 }}>
            COMPLETE YOUR INFORMATION TO CREATE AN ACCOUNT
          </h6>

          <form onSubmit={onSignup} className="d-flex flex-column gap-3">
           

            <div>
              <div className="text-center mb-2" style={{ color: "#d6d6d6", fontSize: 12, fontWeight: 700 }}>
                SECURITY QUESTION
              </div>

              <select
                className="form-select"
                name="securityQuestion"
                value={form.securityQuestion}
                onChange={onChange}
                style={selectStyle}
              >
                <option value="">chose your security question</option>
                <option value="What is your first pet's name?">What is your first pet's name?</option>
                <option value="In what city were you born?">In what city were you born?</option>
                <option value="What is the name of your first school?">What is the name of your first school?</option>
              </select>

              <input
                className="form-control mt-2"
                name="securityAnswer"
                value={form.securityAnswer}
                onChange={onChange}
                placeholder="enter your answer"
                style={inputStyle}
              />
            </div>

            <div
              className="d-flex align-items-center gap-3"
              style={{
                background: "#f6a300",
                borderRadius: 10,
                padding: "10px 12px",
                color: "#111",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <input
                type="checkbox"
                checked={form.acceptTerms}
                onChange={onToggle}
                style={{ width: 18, height: 18 }}
              />
              <div style={{ lineHeight: 1.3 }}>
                By continuing, you agree to our Terms &amp; Conditions and Privacy Policy.
                <br />
                You understand that your files and notes will be encrypted and stored securely.
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn"
                style={{ ...pillBtn, background: "#6a625a", color: "white" }}
                onClick={() => navigate("/register/step1")}
                disabled={loading}
              >
                BACK
              </button>

              <button type="submit" className="btn" style={pillBtn} disabled={loading}>
                {loading ? "..." : "SIGN UP"}
              </button>
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

const selectStyle = {
  background: "#6a625a",
  border: "none",
  color: "white",
  borderRadius: 10,
};

const inputStyle = {
  background: "#6a625a",
  border: "none",
  color: "white",
  borderRadius: 10,
};

const pillBtn = {
  background: "#f6a300",
  color: "#111",
  borderRadius: 999,
  fontWeight: 800,
  padding: "6px 18px",
};