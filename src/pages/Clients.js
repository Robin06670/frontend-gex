import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaEuroSign, FaPlus, FaTrash, FaSearch, FaSort, FaEye } from "react-icons/fa";
import CountUp from "react-countup";
import axios from "axios";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("company");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedClients, setImportedClients] = useState([]);

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

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const data = e.target.result;

    if (file.name.endsWith(".csv")) {
      const parsed = Papa.parse(data, { header: true });
      setImportedClients(parsed.data);
    } else if (file.name.endsWith(".xlsx")) {
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      // Dictionnaire de correspondance FR ➝ EN
      const fieldMap = {
        "Entreprise": "company",
        "Activité": "activity",
        "N° SIREN": "siren",
        "Email": "email",
        "Téléphone": "phone",
        "Adresse": "address",
        "Salariés": "employees",
        "Tarif salarié": "employeeRate",
        "Honoraires comptables": "feesAccounting",
        "Honoraires sociales": "feesSocial",
        "Honoraires juridiques": "feesLegal",
        "Temps théorique": "theoreticalTime",
        "Collaborateur": "collaborator"
      };

      // Conversion automatique des clés
      const mappedClients = json.map(client => {
        const mapped = {};
        for (const [key, value] of Object.entries(client)) {
          const mappedKey = fieldMap[key.trim()] || key;
          mapped[mappedKey] = value;
        }
        return mapped;
      });

      setImportedClients(mappedClients);

    }
  };

  if (file.name.endsWith(".csv")) {
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }
};

return (
  <div className="flex h-screen bg-gray-100 overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6">
      
      {/* En-tête avec bouton Ajouter et Titre */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Liste des Clients</h1>
        {!isCollab && (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/clients/new")} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 flex items-center transition-transform transform hover:scale-105"
            >
              <FaPlus className="mr-2" /> Ajouter Client
            </button>

            <button 
              onClick={() => setShowImportModal(true)} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 flex items-center transition-transform transform hover:scale-105"
            >
              <FaPlus className="mr-2" /> Importer des clients
            </button>
          </div>
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
    {showImportModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg w-[700px] shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Importer des clients (.csv ou .xlsx)</h2>
          <div className="relative group cursor-pointer">
            <span className="bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">?</span>
            <div className="fixed top-[120px] right-[100px] z-[9999] w-[1000px] hidden group-hover:flex flex-col items-start bg-white border border-gray-300 rounded-lg shadow-2xl p-4 text-sm text-gray-800">
              <p className="mb-2 font-semibold">Structure attendue :</p>
              <table className="w-full text-xs border mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Entreprise</th>
                    <th className="border px-2 py-1">Activité</th>
                    <th className="border px-2 py-1">N° SIREN</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Téléphone</th>
                    <th className="border px-2 py-1">Adresse</th>
                    <th className="border px-2 py-1">Salariés</th>
                    <th className="border px-2 py-1">Tarif salarié</th>
                    <th className="border px-2 py-1">Honoraires comptables</th>
                    <th className="border px-2 py-1">Honoraires sociales</th>
                    <th className="border px-2 py-1">Honoraires juridiques</th>
                    <th className="border px-2 py-1">Temps théorique</th>
                    <th className="border px-2 py-1">Collaborateur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1 text-center" colSpan="13">
                      Remplissez les valeurs dans un fichier Excel à importer
                    </td>
                  </tr>
                </tbody>
              </table>

              <a
                href="/assets/modele_import_clients.xlsx"
                download
                className="inline-block mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
              >
                📥 Télécharger le modèle
              </a>

            </div>

          </div>
        </div>

          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileImport}
            className="mb-4 border p-2 w-full"
          />

          {importedClients.length > 0 && (
            <div className="mb-4 max-h-48 overflow-y-auto text-sm border p-2">
              {importedClients.map((client, idx) => (
                <pre key={idx} className="text-xs text-gray-700">{JSON.stringify(client)}</pre>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowImportModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                try {
                  for (const client of importedClients) {
                    // Vérification minimale : company, activity, email
                    if (!client.company || !client.activity || !client.email) {
                      console.warn("⏭️ Client ignoré (champs requis manquants) :", client);
                      continue;
                    }
                    let collaboratorId = null;

                    if (client.collaborator) {
                      // 🛡️ On convertit le nom de collaborateur importé en texte propre
                      const collaboratorName = String(client.collaborator || "").toLowerCase().trim();

                      const collaboratorFound = collaborators.find(
                        (c) =>
                          `${c.firstName} ${c.lastName}`.toLowerCase().trim() === collaboratorName
                      );

                      if (collaboratorFound) {
                        collaboratorId = collaboratorFound._id;
                      } else {
                        console.warn("❗ Collaborateur non trouvé :", client.collaborator);
                      }
                    }

                  
                    const payload = {
                      company: String(client.company || "").trim(),
                      activity: String(client.activity || "").trim(),
                      siren: String(client.siren || "").trim(),
                      email: String(client.email || "").trim(),
                      phone: String(client.phone || "").trim(),
                      address: String(client.address || "").trim(),
                      employees: Number(client.employees || 0),
                      employeeRate: Number(client.employeeRate || 0),
                      feesAccounting: Number(client.feesAccounting || 0),
                      feesSocial: Number(client.feesSocial || 0),
                      feesLegal: Number(client.feesLegal || 0),
                      theoreticalTime: Number(client.theoreticalTime || 0),
                      ...(collaboratorId ? { collaborator: collaboratorId } : {})
                    };
                             
                  
                    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/clients`, payload, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  }

                  alert("✅ Import terminé !");
                  setShowImportModal(false);
                  window.location.reload();
                } catch (error) {
                  console.error("❌ Erreur importation :", error);
                  alert("❌ Une erreur est survenue pendant l'import.");
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Importer tous
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Clients;
