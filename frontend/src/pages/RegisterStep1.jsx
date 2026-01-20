import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function RegisterStep1() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [alert, setAlert] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const showAlert = (message) => {
    setAlert({ message });
    setTimeout(() => setAlert(null), 3000);
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (e.target.name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(e.target.value)) {
        setPasswordError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.");
      } else {
        setPasswordError(null);
      }
    }
  };

  const onNext = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      showAlert("Please fill all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    if (passwordError) {
      showAlert("Please fix the password errors before continuing.");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/signup/step1", {
        method: "POST",
        body: {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        },
      });

      sessionStorage.setItem("signup_token", data.signupToken);

      sessionStorage.setItem(
        "signup_step1",
        JSON.stringify({ fullName: form.fullName, email: form.email })
      );

      navigate("/register/step2");
    } catch (err) {
      showAlert(err.message || "Signup step 1 failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
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
            ENTER YOUR INFORMATION TO CREATE AN ACCOUNT
          </h6>

          <form onSubmit={onNext} className="d-flex flex-column gap-3">
            <Field label="FULL NAME">
              <input
                className="form-control"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                placeholder="enter full name"
                style={inputStyle}
              />
            </Field>

            <Field label="EMAIL ADDRESS">
              <input
                className="form-control"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="enter email address"
                style={inputStyle}
              />
            </Field>

            <Field label="PASSWORD">
              <input
                className="form-control"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="enter password"
                style={inputStyle}
              />
              {passwordError && <div style={passwordErrorStyle}>{passwordError}</div>}
            </Field>

            <Field label="CONFIRM PASSWORD">
              <input
                className="form-control"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                placeholder="confirm password"
                style={inputStyle}
              />
            </Field>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn" style={pillBtn} disabled={loading || passwordError}>
                {loading ? "..." : "NEXT"}
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

function Field({ label, children }) {
  return (
    <div>
      <div style={{ color: "#d6d6d6", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

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

const passwordErrorStyle = {
  color: "red",
  fontSize: "12px",
  marginTop: "6px",
  fontWeight: "500",
};