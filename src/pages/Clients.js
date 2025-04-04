import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaEuroSign, FaPlus, FaTrash, FaSearch, FaSort, FaEye } from "react-icons/fa";
import CountUp from "react-countup";
import axios from "axios";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("company");
  const [sortOrder, setSortOrder] = useState("asc");

  const user = JSON.parse(localStorage.getItem("user"));
  const isCollab = user?.role === "collaborateur";

  useEffect(() => {
    const fetchClientsAndCollaborators = async () => {
      try {
        const token = localStorage.getItem("token");
        const [clientsResponse, collaboratorsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/clients`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const filtered = isCollab
          ? clientsResponse.data.filter(client => {
              const collabId = client.collaborator?._id || client.collaborator;
              return collabId === user.collaboratorId;
            })
          : clientsResponse.data;

        setClients(filtered);
        setCollaborators(collaboratorsResponse.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des clients et collaborateurs :", error);
      }
    };

    fetchClientsAndCollaborators();
  }, []);

  // 📌 Calculer le coût pour chaque client
  const calculateCost = (collaboratorData, theoreticalTime) => {
    const collaboratorId = typeof collaboratorData === "object" ? collaboratorData._id : collaboratorData;
    const collaborator = collaborators.find(c => c._id === collaboratorId);

    if (!collaborator) {
      console.log("❌ Aucun collaborateur trouvé pour l'ID:", collaboratorId, "Données reçues:", collaboratorData);
      return 0;
    }

    if (!collaborator.weeklyHours || !collaborator.cost) {
      console.log("⚠️ Collaborateur invalide:", collaborator);
      return 0;
    }

    const totalCost = collaborator.cost;
    const weeklyHours = collaborator.weeklyHours;
    const annualHours = weeklyHours * 52;

    if (annualHours === 0) {
      console.log("⚠️ Problème: annualHours est 0, division impossible !");
      return 0;
    }

    const cost = (totalCost / annualHours) * Number(theoreticalTime);
    return cost;
  };

  // 📌 Calculer la marge pour chaque client
  const calculateMargin = (client, collaboratorData, theoreticalTime) => {
    const {
      feesAccounting = 0,
      feesSocial = 0,
      feesLegal = 0,
    } = client;
  
    const totalFees = Number(feesAccounting) + Number(feesSocial) + Number(feesLegal);
  
    if (!totalFees || !theoreticalTime) return 0;
  
    const cost = calculateCost(collaboratorData, theoreticalTime);
    return Math.round(totalFees - cost);
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
      if (sortBy === "feesAccounting") return sortOrder === "asc" ? a.feesAccounting - b.feesAccounting : b.feesAccounting - a.feesAccounting;
      if (sortBy === "feesSocial") return sortOrder === "asc" ? a.feesSocial - b.feesSocial : b.feesSocial - a.feesSocial;
      if (sortBy === "feesLegal") return sortOrder === "asc" ? a.feesLegal - b.feesLegal : b.feesLegal - a.feesLegal;
      if (sortBy === "margin") {
        const marginA = calculateMargin(a.fees, a.collaborator, a.theoreticalTime);
        const marginB = calculateMargin(b.fees, b.collaborator, b.theoreticalTime);
        return sortOrder === "asc" ? marginA - marginB : marginB - marginA;
      }
      return 0;
    });

  // 📌 Changer l'ordre de tri
  const toggleSortOrder = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(criteria);
      setSortOrder("asc");
    }
  };

  // 📌 Supprimer un client
  // 📌 Supprimer un client
const handleDeleteClient = async (id) => {
  if (!id) {
    console.error("❌ Erreur: ID du client non fourni !");
    return;
  }

  if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
    try {
      const token = localStorage.getItem("token");
      console.log(`🗑️ Tentative de suppression du client ID: ${id}`);
      
      const response = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log(`✅ Client supprimé avec succès: ${id}`);
        setClients(prevClients => prevClients.filter(client => client._id !== id));
      } else {
        console.error("⚠️ La suppression n'a pas été effectuée correctement.");
      }

    } catch (error) {
      console.error("❌ Erreur lors de la suppression du client :", error.response?.data || error.message);
    }
  }
};

return (
  <div className="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6">
      
      {/* En-tête avec bouton Ajouter et Titre */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Liste des Clients</h1>
        {!isCollab && (
          <button 
            onClick={() => navigate("/clients/new")} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 flex items-center transition-transform transform hover:scale-105"
          >
            <FaPlus className="mr-2" /> Ajouter Client
          </button>
        )}
      </div>

      {/* Barre de recherche */}
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

      {/* Tableau des Clients */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSortOrder("company")}>Entreprise <FaSort className="inline ml-1" /></th>
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSortOrder("activity")}>Activité <FaSort className="inline ml-1" /></th>

              {isCollab && (
                <>
                  <th className="p-2 text-left">Téléphone</th>
                  <th className="p-2 text-left">Email</th>
                </>
              )}

              {!isCollab && (
                <>
                  <th className="p-2 text-left cursor-pointer" onClick={() => toggleSortOrder('feesAccounting')}>H. Comptables <FaSort className="inline ml-1" /></th>
                  <th className="p-2 text-left cursor-pointer" onClick={() => toggleSortOrder('feesSocial')}>H. Sociales <FaSort className="inline ml-1" /></th>
                  <th className="p-2 text-left cursor-pointer" onClick={() => toggleSortOrder('feesLegal')}>H. Juridiques <FaSort className="inline ml-1" /></th>
                  <th className="p-2 text-left cursor-pointer" onClick={() => toggleSortOrder("margin")}>Marge <FaSort className="inline ml-1" /></th>
                  <th className="p-2 text-center">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => {
              const margin = calculateMargin(client, client.collaborator, client.theoreticalTime);
              return (
                <tr key={client._id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{client.company || "N/A"}</td>
                  <td className="p-2">{client.activity || "Non spécifiée"}</td>

                  {isCollab && (
                    <>
                      <td className="p-2">{client.phone || "N/A"}</td>
                      <td className="p-2">{client.email || "N/A"}</td>
                    </>
                  )}

                  {!isCollab && (
                    <>
                      <td className="p-2">{client.feesAccounting || 0} €</td>
                      <td className="p-2">{client.feesSocial || 0} €</td>
                      <td className="p-2">{client.feesLegal || 0} €</td>
                      <td className={`p-2 ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {margin} €
                      </td>
                      <td className="p-2 flex justify-center space-x-4">
                        <button onClick={() => navigate(`/clients/${client._id}`)} className="text-blue-600"><FaEye /></button>
                        <button onClick={() => handleDeleteClient(client._id)} className="text-red-500"><FaTrash /></button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};

export default Clients;
