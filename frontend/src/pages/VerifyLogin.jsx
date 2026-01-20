import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { api } from "../api/http";

export default function ConfirmDevice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const session = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("device_confirm") || "null");
    } catch {
      return null;
    }
  }, []);

  const [form, setForm] = useState({
    deviceName: "",     
    securityAnswer: "",
  });

  useEffect(() => {
    if (!session?.tempToken) {
      navigate("/login", { replace: true });
        return;
    }
    
    setForm((p) => ({ ...p, deviceName: p.deviceName || "My device" }));
  }, [session, navigate]);

  const onChange = (e) => {
    setError("");
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const backToLogin = () => {
    sessionStorage.removeItem("device_confirm");
    navigate("/login", { replace: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const deviceName = form.deviceName.trim();
    const securityAnswer = form.securityAnswer.trim();

    if (!deviceName || !securityAnswer) {
      setError("Please enter a device name and answer the security question.");
      return;
    }

    try {
      setLoading(true);

      const data = await api("/auth/confirm-device", {
        method: "POST",
        token: session.tempToken, //  tempToken as Bearer
        body: { deviceName, securityAnswer }, //  matches backend
      });

      if (data?.token) {
        localStorage.setItem("authToken", data.token);
        sessionStorage.removeItem("device_confirm");
        navigate(data.redirectTo || "/vault", { replace: true });
        return;
      }

      setError(data?.message || "Device confirmation failed.");
    } catch (err) {
      if (err.status === 401) {
        setError("Confirmation session expired. Please login again.");
        return;
      }
      if (err.code === "WRONG_SECURITY_ANSWER") {
        setError("Wrong security answer. Please try again.");
      } else {
        setError(err.message || "Device confirmation failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const email = session?.email || "user@email.com";
  const securityQuestion = session?.securityQuestion || "Security question not set";

  return (
    <AuthLayout titleLeft="SafeVault Directory" titleRight="CONFIRM YOUR DEVICE">
      <div className="row g-3">
        <div className="col-12 col-md-3">
          <ul style={{ color: "#d6d6d6", margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Unified</li>
            <li>High Security</li>
            <li>Mobile and Desktop</li>
          </ul>
        </div>

        <div className="col-12 col-md-6 d-flex justify-content-center">
          <div style={card}>
            <div style={{ fontWeight: 900, color: "#111", marginBottom: 6, fontSize: 13 }}>
              New device detected
            </div>
            <div style={{ fontWeight: 700, color: "#111", marginBottom: 12, fontSize: 12 }}>
              Account: <b>{email}</b>
            </div>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
              <div style={{ textAlign: "left" }}>
                <div style={label}>DEVICE NAME</div>
                <input
                  className="form-control"
                  name="deviceName"
                  value={form.deviceName}
                  onChange={onChange}
                  placeholder="e.g., Taqi's Laptop"
                  style={inputStyle}
                  disabled={loading}
                />
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={label}>SECURITY QUESTION</div>
                <div style={questionBox}>{securityQuestion}</div>
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={label}>YOUR ANSWER</div>
                <input
                  className="form-control"
                  name="securityAnswer"
                  value={form.securityAnswer}
                  onChange={onChange}
                  placeholder="Enter your answer"
                  style={inputStyle}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn" style={pillBtnWhite} disabled={loading}>
                {loading ? "..." : "CONTINUE"}
              </button>

              <button type="button" className="btn" onClick={backToLogin} disabled={loading} style={ghostBtn}>
                Back to Login
              </button>
            </form>
          </div>
        </div>

        <div className="col-12 col-md-3 d-flex justify-content-end align-items-start">
          <div style={logoBox}>▣</div>
        </div>
      </div>
    </AuthLayout>
  );
}


const card = {
  width: "100%",
  maxWidth: 440,
  background: "#d9d9d9",
  borderRadius: 12,
  padding: 22,
  textAlign: "center",
  boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
};

const label = { fontWeight: 900, color: "#1b2a5a", fontSize: 12, marginBottom: 6 };

const inputStyle = { background: "#6a625a", border: "none", color: "white", borderRadius: 10 };

const questionBox = {
  background: "#6a625a",
  color: "white",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
  textAlign: "left",
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

const pillBtnWhite = {
  background: "#ffffff",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "none",
};

const ghostBtn = {
  background: "transparent",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "1px solid rgba(0,0,0,0.25)",
  color: "#111",
};

const logoBox = {
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
