import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#1c1f22" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopNav />

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, padding: 28 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
