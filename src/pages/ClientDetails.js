import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const ClientDetails = () => {
  console.log("📌 ClientDetails.js chargé");

  const params = useParams();
  const id = params.id && params.id !== "undefined" ? params.id : null;
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  console.log("🔎 ID récupéré :", id);
  console.log("🆕 Mode création :", isNew);

  const [clientData, setClientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    fees: "",
    activity: "",
    theoreticalTime: "",
    collaborator: "",
  });

  const [collaborators, setCollaborators] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔄 Initialisation de la page...");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCollaborators(res.data);
        console.log("✅ Collaborateurs chargés :", res.data);
      })
      .catch((err) => {
        console.error("❌ Erreur API Collaborateurs :", err);
        setError("Impossible de charger les collaborateurs.");
      });

    if (!isNew && id) {
      console.log("📥 Tentative de récupération du client avec ID :", id);

      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("✅ Client chargé :", res.data);
          setClientData({
            ...res.data,
            collaborator: res.data.collaborator ? res.data.collaborator._id : "",
          });
        })
        .catch((err) => {
          console.error("❌ Erreur API Client :", err.response?.data || err.message);
          setError("Impossible de charger le client.");
        })
        .finally(() => setLoading(false));
    } else {
      console.warn("⚠️ Mode création activé.");
      setLoading(false);
    }
  }, [id, isNew]);

  const handleSaveChanges = async () => {
    setError("");
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
      return;
    }

    const updatedClientData = {
      ...clientData,
      fees: Number(clientData.fees),
      theoreticalTime: Number(clientData.theoreticalTime),
    };

    console.log("📤 Données envoyées au serveur :", updatedClientData);

    try {
      let response;
      if (isNew) {
        response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/clients`, updatedClientData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/clients/${id}`, updatedClientData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      console.log("✅ Réponse du serveur :", response.data);
      navigate("/clients");
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement du client :", err.response?.data || err.message);
      setError("Impossible d'enregistrer le client. " + (err.response?.data?.message || ""));
    }
  };

  if (loading) {
    return <p className="text-blue-500">⏳ Chargement en cours...</p>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">
          {isNew ? "Ajouter un Client" : "Modifier un Client"}
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            {[
              { key: "firstName", label: "Prénom" },
              { key: "lastName", label: "Nom" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Téléphone" },
              { key: "address", label: "Adresse" },
              { key: "company", label: "Entreprise" },
              { key: "fees", label: "Honoraires (€)", type: "number" },
              { key: "activity", label: "Activité" },
              { key: "theoreticalTime", label: "Temps théorique (h)", type: "number" },
            ].map(({ key, label, type = "text" }, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1">{label}</label>
                <input
                  type={type}
                  value={clientData[key]}
                  onChange={(e) => setClientData({ ...clientData, [key]: e.target.value })}
                  className="p-3 border rounded-lg w-full text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="font-medium text-gray-700">Collaborateur :</label>
            <select
              value={clientData.collaborator}
              onChange={(e) => setClientData({ ...clientData, collaborator: e.target.value })}
              className="p-3 border rounded-lg w-full bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Sélectionner un collaborateur</option>
              {collaborators.map((collab) => (
                <option key={collab._id} value={collab._id}>
                  {collab.firstName} {collab.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => navigate("/clients")}
              className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all"
            >
              Retour à la liste
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
