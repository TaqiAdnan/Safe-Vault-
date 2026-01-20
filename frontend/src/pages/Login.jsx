import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/login", {
        method: "POST",
        body: {
          email: form.email,
          password: form.password,
        },
      });

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        navigate(data.redirectTo || "/vault/search");
        return;
      }
        if (data.code === "NEW_DEVICE" && data.tempToken) {
          sessionStorage.setItem(
            "device_confirm",
            JSON.stringify({
              email: form.email,
              tempToken: data.tempToken,
              securityQuestion: data.securityQuestion,
            })
          );

          navigate(data.redirectTo || "/confirm-device");
          return;
        }

      if (data.code === "ACCOUNT_NOT_VERIFIED") {
        alert("Account not verified. Please complete signup verification.");
        navigate("/register/step1");
        return;
      }

      alert(data.message || "Login failed");
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout titleLeft="SafeVault Directory" titleRight="LOGIN TO YOUR ACCOUNT">
      <div className="row g-3 align-items-start">
        <div className="col-12 col-md-3">
          <ul style={{ color: "#d6d6d6", margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Unified</li>
            <li>High Security</li>
            <li>Mobile and Desktop</li>
          </ul>
        </div>

        <div className="col-12 col-md-6">
          <h6 className="text-center mb-4" style={{ color: "#f6a300", fontWeight: 800 }}>
            NICE TO SEE YOU AGAIN!!
          </h6>

          <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
            <Field label="EMAIL ADDRESS">
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="enter email address"
                style={inputStyle}
              />
            </Field>

            <Field label="PASSWORD">
              <input
                className="form-control"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="enter password"
                style={inputStyle}
              />
            </Field>

            <div className="d-flex align-items-center justify-content-between">
              <button type="submit" className="btn" style={pillBtn} disabled={loading}>
                {loading ? "..." : "LOGIN"}
              </button>

              <Link to="/forgot-password" style={{ color: "#d6d6d6", fontSize: 12, textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            <div className="text-center mt-2" style={{ color: "#d6d6d6", fontSize: 13 }}>
              Don’t have an account?
              <div>
                <Link to="/register/step1" style={{ color: "#f6a300", fontWeight: 800, textDecoration: "none" }}>
                  Sign Up
                </Link>
              </div>
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
