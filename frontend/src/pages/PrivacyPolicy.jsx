import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  const lastUpdated = "January 2026";

  return (
    <div className="min-vh-100" style={shell}>
      {/* Top strip like the app pages */}
      <div style={topStrip}>
        <div style={{ fontWeight: 700 }}>SafeVault Directory</div>
        <Link to="/vault/settings" style={backLink}>
          ← Back to Settings
        </Link>
      </div>

      <div className="container py-4" style={{ maxWidth: 980 }}>
        <div style={card}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
            <div>
              <h2 style={title}>Privacy Policy</h2>
              <div style={subtitle}>
                Last updated: <span style={{ color: "#d6d6d6" }}>{lastUpdated}</span>
              </div>
            </div>

            <div style={badgeWrap}>
              <div style={badge}>
                <span style={{ color: "#f6a300", fontWeight: 900 }}>Security-first</span>
                <div style={{ fontSize: 12, color: "#bdbdbd" }}>Usable Privacy</div>
              </div>
            </div>
          </div>

          <div style={notice}>
            <b style={{ color: "#f6a300" }}>Plain-language summary:</b>{" "}
            We only collect what we need to run SafeVault, we protect it, and you control your data.
          </div>

          <Section number="1" heading="What this policy covers">
            <p style={p}>
              This Privacy Policy explains what information SafeVault collects, why we collect it,
              how we use it, and the choices you have. It applies to the SafeVault website and the
              SafeVault Directory application.
            </p>
          </Section>

          <Section number="2" heading="Information we collect">
            <ul style={ul}>
              <li>
                <b style={b}>Account information:</b> name, email address, and a password (stored securely).
              </li>
              <li>
                <b style={b}>Security verification:</b> your chosen security question and answer (stored securely),
                and trusted device information (for login verification).
              </li>
              <li>
                <b style={b}>Usage & device data:</b> basic logs like login time, browser/app type, and IP address
                for security and troubleshooting.
              </li>
              <li>
                <b style={b}>Content you store:</b> notes/files you upload to your vault. (In a real deployment,
                this should be encrypted at rest and protected in transit.)
              </li>
            </ul>
          </Section>

          <Section number="3" heading="How we use your information">
            <ul style={ul}>
              <li>To create and manage your SafeVault account.</li>
              <li>To authenticate logins (including device confirmation and verification codes).</li>
              <li>To protect users from fraud, abuse, and unauthorized access.</li>
              <li>To provide support and improve performance and usability.</li>
            </ul>
          </Section>

          <Section number="4" heading="Security measures">
            <ul style={ul}>
              <li>
                <b style={b}>Passwords:</b> should be hashed (never stored as plain text).
              </li>
              <li>
                <b style={b}>Encryption:</b> data should be protected in transit (HTTPS/TLS) and at rest where possible.
              </li>
              <li>
                <b style={b}>Access control:</b> only authorized users should access vault data.
              </li>
              <li>
                <b style={b}>Verification:</b> device confirmation + code verification reduce account takeover risk.
              </li>
            </ul>

            <div style={miniNote}>
              <b>Important:</b> This project is a course prototype. Some security controls may be simulated on the front-end.
              In production, all checks must be enforced on the backend.
            </div>
          </Section>

          <Section number="5" heading="Sharing and third parties">
            <p style={p}>
              SafeVault does not sell personal information. We may share limited information only when required for
              providing the service (for example, sending verification emails) or when required by law.
            </p>
          </Section>

          <Section number="6" heading="Data retention">
            <p style={p}>
              We keep your information only as long as needed to provide the service, comply with legal requirements,
              and maintain security logs. You may request deletion of your account in the future (feature dependent).
            </p>
          </Section>

          <Section number="7" heading="Your choices and rights">
            <ul style={ul}>
              <li>Access and update your account information.</li>
              <li>Change your password and security question (feature dependent).</li>
              <li>Review trusted devices.</li>
              <li>Request account deletion (feature dependent).</li>
            </ul>
          </Section>

          <Section number="8" heading="Contact">
            <p style={p}>
              If you have questions about privacy, contact the SafeVault team via the “Contact Us” page.
            </p>
          </Section>

          <div style={footerRow}>
            <Link to="/vault/settings" className="btn" style={btn}>
              Back to Settings
            </Link>
            <Link to="/contact" className="btn" style={btnOutline}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ number, heading, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={sectionHeader}>
        <div style={sectionNum}>{number}</div>
        <div style={sectionTitle}>{heading}</div>
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

/* ===== Styles (match SafeVault theme) ===== */
const shell = {
  background: "#1f2428",
  color: "#fff",
};

const topStrip = {
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 22px",
  background: "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0.25))",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const backLink = {
  color: "#f6a300",
  textDecoration: "none",
  fontWeight: 800,
};

const card = {
  background: "rgba(0,0,0,0.45)",
  borderRadius: 16,
  padding: 26,
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
};

const title = {
  margin: 0,
  fontWeight: 900,
  letterSpacing: 0.2,
};

const subtitle = {
  marginTop: 6,
  fontSize: 13,
  color: "#bdbdbd",
};

const notice = {
  marginTop: 10,
  padding: 14,
  borderRadius: 12,
  background: "rgba(246,163,0,0.08)",
  border: "1px solid rgba(246,163,0,0.25)",
  color: "#e9e9e9",
  fontSize: 13,
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const sectionNum = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "#f6a300",
  color: "#111",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sectionTitle = {
  fontWeight: 900,
  color: "#f6a300",
};

const p = {
  margin: 0,
  color: "#d6d6d6",
  lineHeight: 1.7,
  fontSize: 14,
};

const ul = {
  margin: 0,
  paddingLeft: 18,
  color: "#d6d6d6",
  lineHeight: 1.8,
  fontSize: 14,
};

const b = { color: "#ffffff" };

const miniNote = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#d6d6d6",
  fontSize: 13,
};

const footerRow = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 28,
};

const btn = {
  background: "#f6a300",
  color: "#111",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "none",
};

const btnOutline = {
  background: "transparent",
  color: "#f6a300",
  borderRadius: 999,
  fontWeight: 900,
  padding: "10px 18px",
  border: "1px solid rgba(246,163,0,0.55)",
};

const badgeWrap = { display: "flex", justifyContent: "flex-end" };
const badge = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  minWidth: 160,
  textAlign: "center",
};
