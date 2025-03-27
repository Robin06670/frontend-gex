import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import ClientDetails from "./pages/ClientDetails";
import Collaborators from "./pages/Collaborators"; // ✅ Page Organigramme
import CollaboratorDetails from "./pages/CollaboratorDetails"; // ✅ Page Fiche Collaborateur
import CollaboratorClients from "./pages/CollaboratorClients"; // ✅ Page Clients du Collaborateur
import Statistics from "./pages/Statistics"; // ✅ Page unique pour toutes les stats
import FixedCosts from "./pages/FixedCosts"; // ✅ Page Gestion des Frais Fixes

// 🔍 Fonction pour récupérer le rôle
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || null;
};

export default function App() {
  const role = getUserRole();

  return (
    <Router>
      <Routes>
        {/* 🔹 Pages accessibles à tous */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />

        {/* 🔹 Pages interdites aux collaborateurs */}
        {role !== "collaborateur" && (
          <>
            <Route path="/settings" element={<Settings />} />
            <Route path="/collaborateurs" element={<Collaborators />} /> {/* ✅ Page Organigramme */}
            <Route path="/statistics" element={<Statistics />} /> {/* ✅ Page Statistiques */}
            <Route path="/fixed-costs" element={<FixedCosts />} /> {/* ✅ Page Frais Fixes */}

            {/* 🔹 Clients */}
            <Route path="/clients/new" element={<ClientDetails />} />
            <Route path="/clients/:id" element={<ClientDetails />} />

            {/* 🔹 Collaborateurs */}
            <Route path="/collaborateurs/new" element={<CollaboratorDetails />} />
            <Route path="/collaborateurs/:id" element={<CollaboratorDetails />} />
            <Route path="/collaborateurs/:id/clients" element={<CollaboratorClients />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
