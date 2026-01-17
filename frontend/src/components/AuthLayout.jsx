import MainHeader from "./MainHeader";
import MainFooter from "./MainFooter";

export default function AuthLayout({ titleLeft = "SafeVault Directory", titleRight = "BECOME A MEMBER NOW!", children }) {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "#bdbdbd" }}>
      <MainHeader />

      <main className="flex-grow-1 d-flex justify-content-center align-items-start p-4">
        <div
          className="w-100"
          style={{
            maxWidth: 1000,
            background: "#111",
            borderRadius: 14,
            padding: 22,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {/* Top row titles */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div style={{ color: "#d6d6d6", fontWeight: 600 }}>{titleLeft}</div>
            <div style={{ color: "#d6d6d6", fontWeight: 700 }}>{titleRight}</div>
          </div>

          {/* Inner area */}
          <div
            style={{
              background: "#0f0f0f",
              borderRadius: 12,
              padding: 18,
              border: "1px solid rgba(246,163,0,0.35)",
            }}
          >
            {children}
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
