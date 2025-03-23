import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaArrowLeft, FaArrowUp, FaArrowDown, FaSearch, FaSort } from "react-icons/fa";
import axios from "axios";

const CollaboratorClients = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collaborator, setCollaborator] = useState(null);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Ajout de la recherche
  const [sortBy, setSortBy] = useState("company"); // 📊 Ajout du tri par défaut
  const [sortOrder, setSortOrder] = useState("asc"); // 📊 Tri ascendant par défaut

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Aucun token trouvé.");
      return;
    }

    // 🔄 Récupérer les infos du collaborateur
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCollaborator(res.data))
      .catch((err) => console.error("❌ Erreur API Collaborateur :", err));

    // ✅ Récupérer les clients associés
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/clients?collaborator=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ Clients chargés :", res.data);

        // Assurer que la marge est bien définie
        const updatedClients = res.data.map((client) => ({
          ...client,
          margin:
            client.margin !== undefined
              ? client.margin
              : client.fees && client.cost
              ? client.fees - client.cost
              : 0, // Calcul de secours si `margin` n'est pas stocké
        }));

        setClients(updatedClients);
      })
      .catch((err) => {
        console.error("❌ Erreur API Clients :", err);
        setClients([]);
      });
  }, [id]);

  // 📌 Fonction de tri dynamique
  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // 📌 Filtrer et trier les clients
  const filteredClients = clients
    .filter(client =>
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.activity && client.activity.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "company") return sortOrder === "asc" ? a.company.localeCompare(b.company) : b.company.localeCompare(a.company);
      if (sortBy === "activity") return sortOrder === "asc" ? a.activity.localeCompare(b.activity) : b.activity.localeCompare(a.activity);
      if (sortBy === "fees") return sortOrder === "asc" ? a.fees - b.fees : b.fees - a.fees;
      if (sortBy === "margin") return sortOrder === "asc" ? a.margin - b.margin : b.margin - a.margin;
      return 0;
    });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 flex flex-col justify-between">
        {collaborator ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Clients gérés par {collaborator.firstName} {collaborator.lastName}
            </h1>

            {/* Barre de recherche 🔍 */}
            <div className="relative w-full max-w-lg mx-auto mb-6">
              <input
                type="text"
                placeholder="Rechercher par entreprise ou activité..."
                className="w-full p-2 border rounded pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-500" />
            </div>

            {/* Tableau des clients */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSortOrder("company")}>
                      Entreprise <FaSort className="inline ml-1" />
                    </th>
                    <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSortOrder("activity")}>
                      Activité <FaSort className="inline ml-1" />
                    </th>
                    <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSortOrder("fees")}>
                      Honoraires (€) <FaSort className="inline ml-1" />
                    </th>
                    <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSortOrder("margin")}>
                      Marge (€) <FaSort className="inline ml-1" />
                    </th>
                    <th className="p-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client._id} className="border-t hover:bg-gray-100 transition-all">
                        <td className="p-3">{client.company || "N/A"}</td>
                        <td className="p-3">{client.activity || "N/A"}</td>
                        <td className="p-3 text-blue-600 font-semibold">
                          € {client.fees ? client.fees.toLocaleString() : "N/A"}
                        </td>
                        <td className="p-3 text-blue-600 font-semibold">
                          € {client.margin.toLocaleString()}
                        </td>
                        <td className="p-3">
                          {client.margin >= 0 ? (
                            <FaArrowUp className="text-green-500" />
                          ) : (
                            <FaArrowDown className="text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-5 text-center text-gray-600">
                        Aucun client trouvé pour ce collaborateur.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔙 Bouton retour */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/collaborateurs")}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
              >
                <FaArrowLeft />
                <span>Retour à l'organigramme</span>
              </button>
            </div>
          </>
        ) : (
          <p className="text-red-500 text-center text-lg font-semibold">Collaborateur introuvable.</p>
        )}
      </div>
    </div>
  );
};

export default CollaboratorClients;
