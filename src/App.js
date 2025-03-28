import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import ClientDetails from "./pages/ClientDetails";
import Collaborators from "./pages/Collaborators";
import CollaboratorDetails from "./pages/CollaboratorDetails";
import CollaboratorClients from "./pages/CollaboratorClients";
import Statistics from "./pages/Statistics";
import FixedCosts from "./pages/FixedCosts";
import Timesheet from "./pages/Timesheet"; // ✅ Ajout de l'import

export default function App() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const user = JSON.parse(stored);
        setRole(user.role);
      }
    } catch (e) {
      console.error("❌ Erreur parsing localStorage user:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <Router>
      <Routes>
        {/* 🔹 Pages accessibles à tous */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/timesheet" element={<Timesheet />} /> {/* ✅ Nouvelle route visible pour tous */}

        {/* 🔹 Pages réservées à l’admin/expert */}
        {role !== "collaborateur" && (
          <>
            <Route path="/settings" element={<Settings />} />
            <Route path="/collaborateurs" element={<Collaborators />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/fixed-costs" element={<FixedCosts />} />
            <Route path="/clients/new" element={<ClientDetails />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/collaborateurs/new" element={<CollaboratorDetails />} />
            <Route path="/collaborateurs/:id" element={<CollaboratorDetails />} />
            <Route path="/collaborateurs/:id/clients" element={<CollaboratorClients />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
