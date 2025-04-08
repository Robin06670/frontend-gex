import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const CollaboratorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [Collaborator, setCollaborator] = useState({
    firstName: "",
    lastName: "",
    role: "",
    gender: "Homme",
    salary: "",
    cost: "",
    weeklyHours: "",
    managers: [],
  });

  const [allManagers, setAllManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error("⚠️ Données invalides reçues :", data);
          return;
        }

        setAllManagers(data.filter(c => c._id !== id));

        if (!isNew && id) {
          const existingCollab = data.find(c => c._id === id);
          if (existingCollab) {
            setCollaborator(existingCollab);
          } else {
            console.warn("⚠️ Aucun collaborateur trouvé avec cet ID :", id);
          }
        }
      })
      .catch(err => console.error("❌ Erreur API :", err))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleChange = (e) => {
    setCollaborator({ ...Collaborator, [e.target.name]: e.target.value });
  };

  const handleManagerSelection = (managerId) => {
    setCollaborator(prev => ({
      ...prev,
      managers: prev.managers.includes(managerId)
        ? prev.managers.filter(m => m !== managerId)
        : [...prev.managers, managerId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isNew ? "POST" : "PUT";

    if (!isNew && (!id || id === "null" || id === "undefined")) {
      console.error("❌ Impossible de modifier : ID non valide !");
      return;
    }

    const url = isNew
      ? `${process.env.REACT_APP_API_BASE_URL}/api/collaborators`
      : `${process.env.REACT_APP_API_BASE_URL}/api/collaborators/${id}`;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(Collaborator),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la requête : ${response.statusText}`);
      }

      console.log("✅ Collaborateur enregistré/modifié :", Collaborator);
      navigate("/collaborateurs");
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement du collaborateur :", error);
    }
  };

  const avatarSrc = Collaborator.gender === "Homme" ? "/images/homme.png" : "/images/femme.png";

  if (loading) {
    return <p className="text-center text-gray-500">Chargement des données...</p>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isNew ? "Ajouter un collaborateur" : "Modifier le collaborateur"}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <img src={avatarSrc} alt="Avatar" className="w-32 h-32 rounded-full shadow-md mb-4" />
              <div className="flex space-x-4">
                <button type="button" className={`px-4 py-2 rounded-lg ${Collaborator.gender === "Homme" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setCollaborator({ ...Collaborator, gender: "Homme" })}>
                  Homme
                </button>
                <button type="button" className={`px-4 py-2 rounded-lg ${Collaborator.gender === "Femme" ? "bg-pink-600 text-white" : "bg-gray-200"}`} onClick={() => setCollaborator({ ...Collaborator, gender: "Femme" })}>
                  Femme
                </button>
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input type="text" name="lastName" value={Collaborator.lastName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input type="text" name="firstName" value={Collaborator.firstName} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Poste</label>
                <input type="text" name="role" value={Collaborator.role} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salaire Annuel (€)</label>
                <input type="number" name="salary" value={Collaborator.salary} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coût Annuel (€)</label>
                <input type="number" name="cost" value={Collaborator.cost} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Temps Hebdomadaire (heures)</label>
                <input type="number" name="weeklyHours" value={Collaborator.weeklyHours} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Managers</label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
              {allManagers.map(manager => (
                <label key={manager._id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                  <input type="checkbox" checked={Collaborator.managers.includes(manager._id)} onChange={() => handleManagerSelection(manager._id)} className="form-checkbox h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">{manager.firstName} {manager.lastName}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all">
            {isNew ? "Ajouter le collaborateur" : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CollaboratorDetails;
