import { BrowserRouter, Routes, Route, useLocation } from "react-router";

import { useEffect } from "react";

import HomePage from "./pages/HomePage";
import StudioPage from "./pages/StudioPage";
import TechnologyPage from "./pages/TechnologyPage";
import MetadataPage from "./pages/studio/MetadataPage";
import MetadataEditorPage from "./pages/studio/MetadataEditorPage";
import LearnPage from "./pages/LearnPage";
import CleanerPage from "./pages/studio/CleanerPage";
import NotFoundPage from "./pages/NotFoundPage";

import VaultPage from "./pages/studio/VaultPage";

import useLenis from "./hooks/useLenis";

import PayloadCleanerPage from "./pages/studio/PayloadCleanerPage";

function NavigationHandler() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }
  }, [location.pathname, location.hash]);

  return null;
}

function AppContent() {
  useLenis();

  return (
    <>
      <NavigationHandler />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/technology" element={<TechnologyPage />} />

        <Route path="/learn/:topic" element={<LearnPage />} />

        <Route path="/studio/vault" element={<VaultPage />} />

        <Route path="/studio/metadata" element={<MetadataPage />} />

        <Route path="/studio/metadata-editor" element={<MetadataEditorPage />} />

        <Route path="/studio/cleaner" element={<CleanerPage />} />

        <Route path="/studio/clear-payload" element={<PayloadCleanerPage />} />

        <Route path="/studio/*" element={<StudioPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
