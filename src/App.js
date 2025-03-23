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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Pages principales */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/collaborateurs" element={<Collaborators />} /> {/* ✅ Page Organigramme */}
        <Route path="/statistics" element={<Statistics />} /> {/* ✅ Page Statistiques avec menu interne */}
        <Route path="/fixed-costs" element={<FixedCosts />} /> {/* ✅ Page Gestion des Frais Fixes */}

        {/* 🔹 Routes pour les clients */}
        <Route path="/clients/new" element={<ClientDetails />} /> {/* ✅ Ajouter un client */}
        console.log("📌 Route détectée : /clients/new");
        <Route path="/clients/:id" element={<ClientDetails />} /> {/* ✅ Modifier un client */}
        console.log("📌 Route détectée : /clients/:id");

        {/* 🔹 Routes pour les collaborateurs */}
        <Route path="/collaborateurs/new" element={<CollaboratorDetails />} /> {/* ✅ Ajouter un collaborateur */}
        <Route path="/collaborateurs/:id" element={<CollaboratorDetails />} /> {/* ✅ Modifier un collaborateur */}

        {/* 🔹 Route pour voir les clients gérés par un collaborateur */}
        <Route path="/collaborateurs/:id/clients" element={<CollaboratorClients />} /> {/* ✅ Clients du collaborateur */}
      </Routes>
    </Router>
  );
}
