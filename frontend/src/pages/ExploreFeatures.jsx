import AuthLayout from "../components/AuthLayout";
import MainHeader from "../components/MainHeader";
import MainFooter from "../components/MainFooter";
import { useNavigate } from "react-router-dom";

export default function ExploreFeatures() {
  const navigate = useNavigate();

  return (
    <div style={page}>
      <MainHeader />
      <div style={content}>
        <div style={card}>
          <div style={title}>Explore Features</div>
          <div style={sub}>What you can do inside SafeVault.</div>

          <div style={grid}>
            <Feature
              name="Folders"
              desc="Organize files and subfolders. Each folder shows direct items count."
              onClick={() => navigate("/vault/folders")}
            />
            <Feature
              name="Notes"
              desc="Create, edit, and manage private notes quickly."
              onClick={() => navigate("/vault/notes")}
            />
            <Feature
              name="Upload"
              desc="Upload and store documents safely (demo UI now, backend can be connected)."
              onClick={() => navigate("/vault/upload")}
            />
            <Feature
              name="Search"
              desc="Search across notes, files, and folders."
              onClick={() => navigate("/vault/search")}
            />
            <Feature
              name="Devices"
              desc="Manage trusted devices to secure your login."
              onClick={() => navigate("/vault/devices")}
            />
            <Feature
              name="Settings"
              desc="Update profile and privacy settings."
              onClick={() => navigate("/vault/settings")}
            />
          </div>
        </div>
      </div>
      <MainFooter />
    </div>
  );
}

function Feature({ name, desc, onClick }) {
  return (
    <div style={feature} onClick={onClick}>
      <div style={featureName}>{name}</div>
      <div style={featureDesc}>{desc}</div>
    </div>
  );
}

const page = {
  minHeight: "100vh", 
  padding: 0, 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "space-between", 
  backgroundColor: "#0f0f0f", 
};

const content = {
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  flexGrow: 1, 
  padding: 24,
};

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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const feature = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  cursor: "pointer", 
};

const featureName = { color: "#fff", fontWeight: 900, fontSize: 14 };
const featureDesc = { color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.6 };

