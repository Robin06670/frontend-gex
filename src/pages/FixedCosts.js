import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar"; // Importer le composant Sidebar
import axios from "axios";
import { FaLock, FaUnlock } from "react-icons/fa"; // Importer les icônes

const FixedCosts = () => {
  const [costs, setCosts] = useState({
    petitsMateriels: "",
    energies: "",
    sousTraitance: "",
    loyers: "",
    leasingsMateriels: "",
    leasingsVehicules: "",
    entretienReparations: "",
    logicielsProduction: "",
    assurances: "",
    honoraires: "",
    fraisGeneraux: "",
    fraisActes: "",
    telecomFraisPostaux: "",
    servicesBancaires: "",
    impotsTaxes: "",
    amortissements: "",
    autresFraisFixes: "",
  });

  const [lockedFields, setLockedFields] = useState({});
  const [revenue, setRevenue] = useState(0);
  const costOrder = [
    "petitsMateriels",
    "energies",
    "sousTraitance",
    "loyers",
    "leasingsMateriels",
    "leasingsVehicules",
    "entretienReparations",
    "logicielsProduction",
    "assurances",
    "honoraires",
    "fraisGeneraux",
    "fraisActes",
    "telecomFraisPostaux",
    "servicesBancaires",
    "impotsTaxes",
    "amortissements",
    "autresFraisFixes"
  ];
  
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/clients/revenue`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRevenue(response.data.revenue);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du chiffre d'affaires :", error);
      }
    };

    fetchRevenue();
  }, []);

  useEffect(() => {
    const fetchFixedCosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/fixedcosts`, {
          headers: { Authorization: `Bearer ${token}` }, // ✅ correction URL
        });
        if (response.data) {
          const filteredData = Object.keys(response.data)
          .filter(
            key =>
              key !== "_id" &&
              key !== "createdAt" &&
              key !== "updatedAt" &&
              key !== "__v" &&
              key !== "user" &&
              key !== "cabinet"
          )          
            .reduce((obj, key) => {
              obj[key] = response.data[key];
              return obj;
            }, {});
          setCosts(filteredData);

          const initialLockedFields = {};
          Object.keys(filteredData).forEach((key) => {
            initialLockedFields[key] = true;
          });
          setLockedFields(initialLockedFields);
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des frais fixes :", error);
      }
    };

    fetchFixedCosts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCosts({ ...costs, [name]: value });
  };

  const handleLock = async (field) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/fixedcosts/${field}`, { value: costs[field] }, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ correction URL
      });
      setLockedFields({ ...lockedFields, [field]: true });
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du frais fixe :", error);
      alert("Erreur lors de la mise à jour du frais fixe");
    }
  };

  const handleUnlock = (field) => {
    setLockedFields({ ...lockedFields, [field]: false });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Gestion des Frais Fixes</h1>
        <form className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
        {costOrder.map((key) => {
            const costValue = parseFloat(costs[key]) || 0;
            const percentage = revenue ? ((costValue / revenue) * 100).toFixed(2) : 0;

            return (
              <div key={key} className="flex items-center space-x-4">
                <div className="flex flex-col flex-1">
                  <label htmlFor={key} className="text-sm font-semibold mb-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </label>
                  <input
                    type="number"
                    id={key}
                    name={key}
                    value={costs[key]}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-lg"
                    disabled={lockedFields[key]}
                  />
                </div>
                <div className="text-sm font-semibold text-gray-700 mt-4">
                  {percentage}% du CA
                </div>
                {lockedFields[key] ? (
                  <button
                    type="button"
                    onClick={() => handleUnlock(key)}
                    className="bg-gray-500 text-white p-2 rounded-full shadow-md hover:bg-gray-600 transition-all duration-200 mt-4"
                  >
                    <FaLock />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLock(key)}
                    className="bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-all duration-200 mt-4"
                  >
                    <FaUnlock />
                  </button>
                )}
              </div>
            );
          })}
        </form>
      </div>
    </div>
  );
};

export default FixedCosts;
