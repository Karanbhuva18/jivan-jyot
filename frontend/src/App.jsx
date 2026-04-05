import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout.jsx";
import PatientReport from "./pages/PatientReport.jsx";
import CompanyPatient from "./pages/CompanyPatient.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI
        .setup()
        .then((result) => {
          console.log("Backend status:", result.status);
          setBackendReady(true);
        })
        .catch((err) => {
          console.error("Backend setup failed:", err);
          setBackendReady(true); // still open the app, backend may recover
        });
    } else {
      // Browser / dev mode — backend already running via npm run dev
      setBackendReady(true);
    }
  }, []);

  if (!backendReady) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "sans-serif",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e0e0e0",
            borderTop: "4px solid #1976d2",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#555", fontSize: "16px" }}>
          Starting application...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <HashRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Layout>
        <Routes>
          <Route path="/" element={<PatientReport />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/company-patient" element={<CompanyPatient />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
