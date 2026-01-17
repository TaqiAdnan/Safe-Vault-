export default function AboutUs() {
    return (
      <div style={page}>
        <div style={card}>
          <div style={title}>About SafeVault</div>
          <div style={sub}>
            SafeVault is a simple and secure personal vault that helps you organize your folders, files,
            and notes — with privacy-first design.
          </div>
  
          <div style={section}>
            <div style={h}>What we protect</div>
            <ul style={ul}>
              <li>Your personal files and documents</li>
              <li>Your private notes</li>
              <li>Your account access using trusted devices</li>
            </ul>
          </div>
  
          <div style={section}>
            <div style={h}>Our goal</div>
            <div style={p}>
              Keep everything organized and easy to access, while reducing security mistakes and improving usability.
            </div>
          </div>
  
          <div style={footer}>SafeVault • Privacy-first • Simple • Secure</div>
        </div>
      </div>
    );
  }
  
  const page = { minHeight: "calc(100vh - 80px)", padding: 24, display: "flex", justifyContent: "center" };
  
  const card = {
    width: "100%",
    maxWidth: 860,
    background: "#0f0f0f",
    borderRadius: 16,
    border: "1px solid rgba(246,163,0,0.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    padding: 22,
  };
  
  const title = { color: "#f6a300", fontWeight: 900, fontSize: 22, marginBottom: 8 };
  const sub = { color: "rgba(255,255,255,0.75)", lineHeight: 1.6, fontSize: 13 };
  const section = { marginTop: 18 };
  const h = { color: "#fff", fontWeight: 900, fontSize: 14, marginBottom: 8 };
  const p = { color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6 };
  const ul = { color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.8, paddingLeft: 18, margin: 0 };
  const footer = { marginTop: 18, color: "rgba(255,255,255,0.45)", fontSize: 12 };
  