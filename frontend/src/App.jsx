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
import VerifyMfa from "./pages/VerifyMfa";
import EnableMfa from "./pages/EnableMfa";

// Vault layout + pages
import Layout from "./components/Layout";
import Folders from "./pages/Folders";
import FolderDetails from "./pages/FolderDetails";
import Notes from "./pages/Notes";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Devices from "./pages/Devices";
import EditProfile from "./pages/EditProfile";

import AboutUs from "./pages/AboutUs";
import HelpCenter from "./pages/HelpCenter";
import Subscriptions from "./pages/Subscriptions";
import ContactUs from "./pages/ContactUs";
import ExploreFeatures from "./pages/ExploreFeatures";

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
      <Route path="/verify-mfa" element={<VerifyMfa />} />

      {/* Vault (nested routes) */}
      <Route path="/vault" element={<Layout />}>
        <Route index element={<Navigate to="/vault/search" replace />} />

        <Route path="folders" element={<Folders />} />
        {/* folder details */}
        <Route path="folders/:folderId" element={<FolderDetails />} />
        {/*upload inside a folder */}
        <Route path="folders/:folderId/upload" element={<Upload />} />

        <Route path="notes" element={<Notes />} />
        <Route path="search" element={<Search />} />

        
        <Route path="upload" element={<Navigate to="/vault/folders" replace />} />

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

      {/* old upload route redirect */}
      <Route path="/upload" element={<Navigate to="/vault/folders" replace />} />

      <Route path="/settings" element={<Navigate to="/vault/settings" replace />} />

      {/* Placeholder links */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/explore" element={<ExploreFeatures />} />


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
