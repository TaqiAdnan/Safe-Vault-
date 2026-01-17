import { Routes, Route, Navigate } from "react-router-dom";

// Public pages
import MainPage from "./pages/MainPage";
import RegisterStep1 from "./pages/RegisterStep1";
import RegisterStep2 from "./pages/RegisterStep2";
import Login from "./pages/Login";
import VerifyLogin from "./pages/VerifyLogin";
import VerifyCode from "./pages/VerifyCode";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
// Vault layout + pages
import Layout from "./components/Layout";
import Folders from "./pages/Folders";
import Notes from "./pages/Notes";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Devices from "./pages/Devices";
import EditProfile from "./pages/EditProfile";


export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<MainPage />} />

      {/* Register (2 steps) */}
      <Route path="/register" element={<Navigate to="/register/step1" replace />} />
      <Route path="/register/step1" element={<RegisterStep1 />} />
      <Route path="/register/step2" element={<RegisterStep2 />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/confirm-device" element={<VerifyLogin />} />
      <Route path="/verify" element={<Navigate to="/confirm-device" replace />} />    
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/VerifyCode" element={<Navigate to="/verify-code" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Vault (nested routes) */}
      <Route path="/vault" element={<Layout />}>
        <Route index element={<Folders />} />
        <Route path="folders" element={<Folders />} />
        <Route path="notes" element={<Notes />} />
        <Route path="search" element={<Search />} />
        <Route path="upload" element={<Upload />} />
        <Route path="settings" element={<Settings />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="devices" element={<Devices />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="change-password" element={<ChangePassword />} />



      </Route>

      {/* Compatibility routes */}
      <Route path="/folders" element={<Navigate to="/vault/folders" replace />} />
      <Route path="/notes" element={<Navigate to="/vault/notes" replace />} />
      <Route path="/search" element={<Navigate to="/vault/search" replace />} />
      <Route path="/upload" element={<Navigate to="/vault/upload" replace />} />
      <Route path="/settings" element={<Navigate to="/vault/settings" replace />} />

      {/* Placeholder links */}
      <Route path="/about" element={<div style={pageStyle}>About Us</div>} />
      <Route path="/help" element={<div style={pageStyle}>Help Center</div>} />
      <Route path="/subscriptions" element={<div style={pageStyle}>Subscriptions</div>} />
      <Route path="/contact" element={<div style={pageStyle}>Contact Us</div>} />
      <Route path="/terms" element={<div style={pageStyle}>Terms & Conditions</div>} />
      <Route path="/team" element={<div style={pageStyle}>Our Team</div>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const pageStyle = {
  padding: 40,
  fontSize: 22,
  fontWeight: 700,
};
