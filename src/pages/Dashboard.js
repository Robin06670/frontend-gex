import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaUsers, FaUserTie, FaThLarge, FaHome } from "react-icons/fa"; // Importer l'icône FaHome
import CountUp from "react-countup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, collaborators: 0 });
  const [profileData, setProfileData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCabinet, setNewCabinet] = useState({
    cabinetName: "",
    address: "",
    collaborators: "",
    phone: "",
    email: "",
    logo: "",
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const [clientsRes, collaboratorsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/clients/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators/count-with-managers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          clients: clientsRes.data.count,
          collaborators: collaboratorsRes.data.count,
        });

        console.log("📊 Stats mises à jour :", {
          clients: clientsRes.data.count,
          collaborators: collaboratorsRes.data.count,
        });

      } catch (error) {
        console.error("❌ Erreur lors du chargement des statistiques :", error);
      }
    };

    const fetchCabinetData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setProfileData(response.data);
        } else {
          setShowModal(true); // Afficher la modale si aucun cabinet n'est trouvé
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des informations du cabinet :", error);
        setShowModal(true);
      }
    };

    fetchCabinetData();
    fetchDashboardStats();
  }, []);

  const handleChange = (e) => {
    setNewCabinet({ ...newCabinet, [e.target.name]: e.target.value });
  };

  const handleSaveCabinet = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/settings`, newCabinet, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement du cabinet :", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Topbar />

        <main className="p-6 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
            <FaHome className="text-blue-700 mr-2" /> {/* Utilisation de l'icône FaHome */}
            Accueil {/* Changement du titre */}
          </h1>

          {profileData ? (
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg text-center mb-6">
              {profileData?.logo && (
                <img
                  src={profileData.logo}
                  alt="Logo Cabinet"
                  className="w-20 h-20 mx-auto rounded-full shadow-lg object-cover mb-4"
                />
              )}
              <h2 className="text-xl font-semibold">{profileData?.cabinetName || "Nom du cabinet"}</h2>
              <p className="text-gray-600">{profileData?.address || "Adresse du cabinet"}</p>
            </div>
          ) : (
            <p className="text-red-500">Impossible de récupérer les données.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
              icon={<FaUsers />}
              title="Clients"
              value={stats.clients}
              color="bg-gradient-to-r from-blue-700 to-blue-900"
              onClick={() => navigate("/clients")}
            />
            <StatCard
              icon={<FaUserTie />}
              title="Collaborateurs"
              value={stats.collaborators}
              color="bg-gradient-to-r from-teal-500 to-green-700"
              onClick={() => navigate("/collaborateurs")}
            />
          </div>
        </main>
      </div>

      {/* MODALE D'AJOUT DU CABINET */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Ajoutez votre cabinet</h2>
            <input
              type="text"
              name="cabinetName"
              placeholder="Nom du cabinet"
              value={newCabinet.cabinetName}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="text"
              name="address"
              placeholder="Adresse"
              value={newCabinet.address}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="number"
              name="collaborators"
              placeholder="Nombre de collaborateurs"
              value={newCabinet.collaborators}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Téléphone"
              value={newCabinet.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newCabinet.email}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-4"
            />

            <button onClick={handleSaveCabinet} className="bg-green-600 text-white p-2 rounded w-full hover:bg-green-700">
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 📌 **Définition du composant StatCard**
const StatCard = ({ icon, title, value, color, onClick }) => {
  return (
    <div
      className={`p-6 ${color} text-white rounded-lg shadow-lg flex items-center ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="text-4xl mr-4">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-2xl">
          <CountUp end={value} duration={2} separator=" " />
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
