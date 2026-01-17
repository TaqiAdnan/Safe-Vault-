export default function Subscriptions() {
    return (
      <div style={page}>
        <div style={card}>
          <div style={title}>Subscriptions</div>
          <div style={sub}>Choose a plan that fits your needs.</div>
  
          <div style={plans}>
            <Plan
              name="Free"
              price="£0 / month"
              features={["Basic folders", "Basic notes", "Trusted device login"]}
            />
            <Plan
              name="Pro"
              price="£4.99 / month"
              highlight
              features={[
                "More storage",
                "Faster search",
                "File version history (coming soon)",
                "Priority support",
              ]}
            />
            <Plan
              name="Team"
              price="£12.99 / month"
              features={["Shared vault (coming soon)", "Team roles", "Audit logs (coming soon)"]}
            />
          </div>
  
          <div style={note}>
            Note: Payments are not enabled yet in this demo. These plans are for UI/testing.
          </div>
        </div>
      </div>
    );
  }
  
  function Plan({ name, price, features, highlight }) {
    return (
      <div style={{ ...plan, borderColor: highlight ? "rgba(246,163,0,0.55)" : "rgba(255,255,255,0.08)" }}>
        <div style={{ ...planName, color: highlight ? "#f6a300" : "#fff" }}>{name}</div>
        <div style={planPrice}>{price}</div>
        <ul style={ul}>
          {features.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <button style={{ ...btn, opacity: 0.85 }} type="button">
          Select
        </button>
      </div>
    );
  }
  
  const page = { minHeight: "calc(100vh - 80px)", padding: 24, display: "flex", justifyContent: "center" };
  
  const card = {
    width: "100%",
    maxWidth: 980,
    background: "#0f0f0f",
    borderRadius: 16,
    border: "1px solid rgba(246,163,0,0.25)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    padding: 22,
  };
  
  const title = { color: "#f6a300", fontWeight: 900, fontSize: 22, marginBottom: 8 };
  const sub = { color: "rgba(255,255,255,0.65)", fontSize: 13, marginBottom: 16 };
  
  const plans = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  };
  
  const plan = {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  };
  
  const planName = { fontWeight: 900, fontSize: 14 };
  const planPrice = { color: "rgba(255,255,255,0.7)", fontSize: 12 };
  
  const ul = {
    margin: 0,
    paddingLeft: 18,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 1.8,
  };
  
  const btn = {
    marginTop: 6,
    background: "#f6a300",
    border: "none",
    color: "#111",
    borderRadius: 999,
    fontWeight: 900,
    padding: "10px 14px",
    cursor: "pointer",
  };
  
  const note = { marginTop: 16, color: "rgba(255,255,255,0.55)", fontSize: 12 };
  