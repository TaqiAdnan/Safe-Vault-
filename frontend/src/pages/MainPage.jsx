import { Link } from "react-router-dom";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";

export default function MainPage() {
  const token = localStorage.getItem("authToken");
  const openVaultTo = token ? "/vault" : "/login";

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "#bdbdbd" }}>
      <MainHeader />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div
          className="w-100"
          style={{
            maxWidth: 980,
            background: "#111",
            borderRadius: 12,
            padding: 40,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              border: "2px solid #f6a300",
              borderRadius: 10,
              padding: 36,
              textAlign: "center",
            }}
          >
            <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: "#f6a300",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#111",
                }}
                aria-hidden="true"
              >
                🔒
              </div>

              <h1 className="m-0 fw-bold" style={{ color: "#f6a300" }}>
                SafeVault Directory
              </h1>
            </div>

            <p className="mb-4" style={{ color: "#d6d6d6", maxWidth: 640, margin: "0 auto" }}>
              SafeVault keeps your personal and work information protected in one encrypted space.
              Store, organize, and access your private files securely anytime, anywhere.
            </p>

            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
              <Link
                to="/register/step1"
                className="btn px-4 py-2"
                style={{ background: "#6a625a", color: "white", border: "none" }}
              >
                CREATE AN ACCOUNT
              </Link>

              <Link
                to="/features"
                className="btn px-4 py-2"
                style={{ background: "#6a625a", color: "white", border: "none" }}
              >
                EXPLORE FEATURES
              </Link>

              <Link
                to={openVaultTo}
                className="btn px-4 py-2"
                style={{ background: "#6a625a", color: "white", border: "none" }}
              >
                OPEN YOUR VAULT
              </Link>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
