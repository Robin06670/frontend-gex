import React, { useState } from "react";

const SetupProfile = ({ onComplete }) => {
  const [cabinetName, setCabinetName] = useState("");
  const [address, setAddress] = useState("");
  const [collaborators, setCollaborators] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result); // Convertit l’image en base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sauvegarder les données dans localStorage
    const profileData = { cabinetName, address, collaborators, phone, email, logo };
    localStorage.setItem("profileCompleted", JSON.stringify(profileData));

    // Indiquer que la configuration est terminée
    onComplete();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Configuration du Cabinet</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom du cabinet"
            value={cabinetName}
            onChange={(e) => setCabinetName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Nombre de collaborateurs"
            value={collaborators}
            onChange={(e) => setCollaborators(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email professionnel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          {/* Upload du Logo */}
          <div>
            <label className="block text-gray-700 font-semibold">Logo du cabinet (optionnel)</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-2 border rounded" />
            {logo && <img src={logo} alt="Logo Preview" className="w-20 h-20 mt-2 rounded shadow" />}
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;
