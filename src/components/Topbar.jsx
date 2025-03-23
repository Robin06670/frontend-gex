import React, { useState, useEffect } from "react";
import axios from "axios"; // Import d'Axios pour faire la requête

const Topbar = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ Aucun token trouvé !");
      return;
    }

    // Appel API pour récupérer les infos utilisateur
    axios
      .get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setProfileData(response.data); // Met à jour les données du profil
      })
      .catch((error) => {
        console.error("❌ Erreur lors de la récupération du profil :", error);
      });
  }, []);

  return (
    <div className="bg-white shadow flex justify-between items-center p-4">
      <h2 className="text-lg font-semibold">Bienvenue sur GEX</h2>
      <div className="flex items-center space-x-4">
        {profileData?.cabinet?.logo && (
          <img 
            src={profileData.cabinet.logo} 
            alt="Cabinet Logo" 
            className="w-12 h-12 rounded-full shadow-lg object-cover"
          />
        )}
        <span className="text-gray-600 text-md font-medium">
          Bienvenue, <span className="font-semibold text-gray-900">
            {profileData?.firstName ? profileData.firstName : "Utilisateur"}
          </span>
        </span>
      </div>
    </div>
  );
};

export default Topbar;
