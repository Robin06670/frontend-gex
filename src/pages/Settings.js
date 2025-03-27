import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "./Settings.css"; // Importer le fichier CSS

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    cabinetName: "",
    address: "",
    collaborators: "",
    phone: "",
    email: "",
    logo: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(""); // ✅ rôle utilisateur
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("collaborateur");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserRole(response.data.role || "");

        const settingsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/settings`, {
          headers: { Authorization: token }
        });

        if (settingsRes.data) {
          setProfileData(settingsRes.data);
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement :", err);
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/settings`, profileData, {
        headers: { Authorization: token }
      });
      alert("Modifications enregistrées !");
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement :", err);
      alert("Une erreur est survenue !");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  // ✅ Envoi de l'invitation
  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/invites`, {
        email: inviteEmail,
        role: inviteRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Utilisateur invité avec succès !");
      setInviteEmail("");
      setInviteRole("collaborateur");
    } catch (err) {
      console.error("❌ Erreur lors de l'invitation :", err);
      alert("Erreur lors de l'invitation.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Paramètres</h2>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto w-full">
              <h3 className="text-xl font-semibold mb-4">Informations du Cabinet</h3>
              <input type="text" name="cabinetName" placeholder="Nom du cabinet" value={profileData.cabinetName} onChange={handleChange} className="w-full p-2 border rounded mb-4" />
              <input type="text" name="address" placeholder="Adresse" value={profileData.address} onChange={handleChange} className="w-full p-2 border rounded mb-4" />
              <input type="number" name="collaborators" placeholder="Nombre de collaborateurs" value={profileData.collaborators} onChange={handleChange} className="w-full p-2 border rounded mb-4" />
              <input type="tel" name="phone" placeholder="Téléphone" value={profileData.phone} onChange={handleChange} className="w-full p-2 border rounded mb-4" />
              <input type="email" name="email" placeholder="Email professionnel" value={profileData.email} onChange={handleChange} className="w-full p-2 border rounded mb-4" />

              <div>
                <label className="block text-gray-700 font-semibold">Logo du cabinet</label>
                <div className="flex items-center">
                  <div className="custom-file-upload">
                    <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="w-full p-2 border rounded" />
                    <button type="button" onClick={handleFileButtonClick} className="w-full p-2 border rounded bg-gray-200 hover:bg-gray-300">
                      {profileData.logo ? "Modifier le logo" : "Choisir un fichier"}
                    </button>
                  </div>
                  {profileData.logo && (
                    <img src={profileData.logo} alt="Logo Cabinet" className="w-24 h-24 rounded-full shadow-lg object-cover ml-4" />
                  )}
                </div>
              </div>

              <button onClick={handleSave} className="mt-4 w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                Enregistrer les modifications
              </button>
            </div>

            {/* 🔐 Bloc admin uniquement */}
            {userRole === "admin" && (
              <div className="bg-white p-6 mt-6 rounded-lg shadow-md max-w-md mx-auto w-full">
                <h3 className="text-xl font-semibold mb-4">Inviter un utilisateur</h3>
                <input
                  type="email"
                  placeholder="Email de l'utilisateur"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                >
                  <option value="collaborateur">Collaborateur</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={handleInvite}
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Envoyer l'invitation
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <button onClick={handleLogout} className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded w-40">
            Se Déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
