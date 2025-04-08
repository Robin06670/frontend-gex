import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import OrgChart from "../components/OrgChart";

function Collaborators() {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState([]);

  // ✅ Récupérer les collaborateurs depuis l'API avec token JWT
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ Récupère le token
        if (!token) {
          console.error("⚠️ Aucun token trouvé !");
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ✅ Ajout du token ici
          }
        });

        if (!response.ok) throw new Error(`Erreur API: ${response.status} ${response.statusText}`);

        const data = await response.json();
        setCollaborators(data || []); // ✅ Assure que `setCollaborators` reçoit un tableau
      } catch (error) {
        console.error("❌ Erreur API :", error);
        setCollaborators([]); // ✅ Évite l'erreur `forEach` sur `undefined`
      }
    };

    fetchCollaborators();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6 relative">
        <div className="absolute top-4 right-6">
          <button
            onClick={() => navigate("/collaborateurs/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300"
          >
            + Ajouter un collaborateur
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Organigramme des Collaborateurs
        </h1>
        <OrgChart key={collaborators.length} collaborators={collaborators} />
      </div>
    </div>
  );
}

export default Collaborators;
