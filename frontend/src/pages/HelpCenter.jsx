export default function HelpCenter() {
    return (
      <div style={page}>
        <div style={card}>
          <div style={title}>Help Center</div>
          <div style={sub}>Quick answers to common questions.</div>
  
          <div style={grid}>
            <Item
              q="How do I create a folder?"
              a="Go to Vault → Folders, then press the + button."
            />
            <Item
              q="How do I add items inside a folder?"
              a="Open the folder, then press + Add to create a subfolder or upload a file."
            />
            <Item
              q="How do I reset my password?"
              a="Go to Login → Forgot Password, then follow the OTP steps."
            />
            <Item
              q="What is a trusted device?"
              a="It’s a device you approved, so login is faster and safer."
            />
            <Item
              q="Why do I see 'Missing auth token'?"
              a="You’re calling a protected API without Authorization header. Ensure you send Bearer token."
            />
          </div>
  
          <div style={tip}>
            Tip: If something breaks, try logging out and logging in again, then refresh the page.
          </div>
        </div>
      </div>
    );
  }
  
  function Item({ q, a }) {
    return (
      <div style={item}>
        <div style={qStyle}>{q}</div>
        <div style={aStyle}>{a}</div>
      </div>
    );
  }
  
  const page = { minHeight: "calc(100vh - 80px)", padding: 24, display: "flex", justifyContent: "center" };
  
  const card = {
    width: "100%",
    maxWidth: 900,
    background: "#0f0f0f",
    borderRadius: 16,
    border: "1px solid rgba(246,163,0,0.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    padding: 22,
  };
  
  const title = { color: "#f6a300", fontWeight: 900, fontSize: 22, marginBottom: 8 };
  const sub = { color: "rgba(255,255,255,0.65)", fontSize: 13, marginBottom: 16 };
  
  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  };
  
  const item = {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  };
  
  const qStyle = { color: "#fff", fontWeight: 900, fontSize: 13, marginBottom: 6 };
  const aStyle = { color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.6 };
  const tip = { marginTop: 16, color: "rgba(255,255,255,0.55)", fontSize: 12 };
  