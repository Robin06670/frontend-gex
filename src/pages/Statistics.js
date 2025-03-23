import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaChartLine, FaUserTie, FaEuroSign, FaMoneyBillWave, FaClock, FaBuilding } from "react-icons/fa";
import { Pie, Bar } from "react-chartjs-2"; // Importer les composants Pie et Bar de react-chartjs-2
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"; // Importer les composants nécessaires de chart.js

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement); // Enregistrer les composants nécessaires

const Statistics = () => {
  const [activeTab, setActiveTab] = useState("revenue"); // Par défaut, afficher le CA
  const [revenue, setRevenue] = useState(0);
  const [revenueByCollaborator, setRevenueByCollaborator] = useState([]);
  const [grossMargin, setGrossMargin] = useState(0);
  const [marginByCollaborator, setMarginByCollaborator] = useState([]);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [payrollByCollaborator, setPayrollByCollaborator] = useState([]);
  const [timeByCollaborator, setTimeByCollaborator] = useState([]);
  const [fixedCosts, setFixedCosts] = useState({});
  const [totalFixedCosts, setTotalFixedCosts] = useState(0);
  const [operatingResult, setOperatingResult] = useState(0);
  const [clientsByCollaborator, setClientsByCollaborator] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
  
        if (activeTab === "revenue") {
          const revenueRes = await axios.get("http://localhost:5000/api/clients/revenue", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const revenueByCollabRes = await axios.get("http://localhost:5000/api/clients/revenue-by-collaborator", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("Revenue Response:", revenueRes.data);
          console.log("Revenue by Collaborator Response:", revenueByCollabRes.data);
  
          setRevenue(revenueRes.data.revenue);
          setRevenueByCollaborator(revenueByCollabRes.data);
        } 
        else if (activeTab === "gross-margin") {
          const revenueRes = await axios.get("http://localhost:5000/api/clients/revenue", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const payrollRes = await axios.get("http://localhost:5000/api/collaborators/payroll", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const revenueByCollabRes = await axios.get("http://localhost:5000/api/clients/revenue-by-collaborator", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const payrollByCollabRes = await axios.get("http://localhost:5000/api/collaborators/payroll-by-collaborator", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const totalRevenue = revenueRes.data.revenue;
          const totalPayroll = payrollRes.data.payroll;
          const grossMarginCalculated = totalRevenue - totalPayroll;
  
          setGrossMargin(grossMarginCalculated);
  
          const updatedMargins = revenueByCollabRes.data.map(collab => {
            const cost = payrollByCollabRes.data.find(p => p._id === collab._id)?.cost || 0;
            return {
              ...collab,
              margin: collab.revenue - cost,
            };
          });
  
          setMarginByCollaborator(updatedMargins);
        } 
        else if (activeTab === "payroll") {
          const payrollRes = await axios.get("http://localhost:5000/api/collaborators/payroll", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const payrollByCollabRes = await axios.get("http://localhost:5000/api/collaborators/payroll-by-collaborator", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          setTotalPayroll(payrollRes.data.payroll);
          setPayrollByCollaborator(payrollByCollabRes.data);
        }
        else if (activeTab === "time-consumed") {
          const timeByCollabRes = await axios.get("http://localhost:5000/api/collaborators/time-data", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const clientsByCollabRes = await axios.get("http://localhost:5000/api/collaborators/clients-by-collaborator", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("✅ Données de temps consommé par collaborateur :", timeByCollabRes.data);
          console.log("✅ Données de clients par collaborateur :", clientsByCollabRes.data);
          setTimeByCollaborator(timeByCollabRes.data);
          setClientsByCollaborator(clientsByCollabRes.data);
        }
        else if (activeTab === "fixed-costs") {
          const fixedCostsRes = await axios.get("http://localhost:5000/api/fixedcosts", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const costs = fixedCostsRes.data;
          const filteredCosts = Object.keys(costs)
            .filter(key => key !== "_id" && key !== "createdAt" && key !== "updatedAt" && key !== "__v")
            .reduce((obj, key) => {
              obj[key] = costs[key];
              return obj;
            }, {});
          setFixedCosts(filteredCosts);
  
          const total = Object.values(filteredCosts).reduce((sum, cost) => sum + parseFloat(cost || 0), 0);
          setTotalFixedCosts(total);
        }
  
        if (activeTab === "operating-result") {
          const revenueRes = await axios.get("http://localhost:5000/api/clients/revenue", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const payrollRes = await axios.get("http://localhost:5000/api/collaborators/payroll", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fixedCostsRes = await axios.get("http://localhost:5000/api/fixedcosts", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const totalRevenue = revenueRes.data.revenue;
          const totalPayroll = payrollRes.data.payroll;
          const costs = fixedCostsRes.data;
          const filteredCosts = Object.keys(costs)
            .filter(key => key !== "_id" && key !== "createdAt" && key !== "updatedAt" && key !== "__v")
            .reduce((obj, key) => {
              obj[key] = costs[key];
              return obj;
            }, {});
          const totalFixedCosts = Object.values(filteredCosts).reduce((sum, cost) => sum + parseFloat(cost || 0), 0);
  
          setRevenue(totalRevenue);
          setTotalPayroll(totalPayroll);
          setFixedCosts(filteredCosts);
          setTotalFixedCosts(totalFixedCosts);
  
          const operatingResultCalculated = totalRevenue - totalPayroll - totalFixedCosts;
          setOperatingResult(operatingResultCalculated);
        }
  
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des données statistiques :", error);
      }
    };
  
    fetchData(); // ✅ Appel immédiat
  }, [activeTab]);  

  const colors = [
    "#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE7D", "#59A14F", "#8CD17D", "#B6992D", "#F1CE63", "#499894", "#86BCB6", 
    "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295", "#FABFD2", "#B07AA1", "#D4A6C8", "#9D7660", "#D7B5A6"
  ];

  const fixedCostsData = {
    labels: Object.keys(fixedCosts),
    datasets: [
      {
        data: Object.values(fixedCosts).map(cost => parseFloat(cost || 0)),
        backgroundColor: colors,
        hoverBackgroundColor: colors,
      },
    ],
  };

  const barData = {
    labels: Object.keys(fixedCosts),
    datasets: [
      {
        label: 'Frais Fixes',
        data: Object.values(fixedCosts).map(cost => parseFloat(cost || 0)),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, // Supprimer les légendes
      },
    },
    maintainAspectRatio: false, // Permettre de définir une taille personnalisée
  };

  const barOptions = {
    plugins: {
      legend: {
        display: false, // Supprimer les légendes
      },
    },
    scales: {
      x: {
        display: false, // Masquer les étiquettes de l'axe des x
      },
      y: {
        beginAtZero: true,
        display: false, // Masquer les étiquettes de l'axe des y
      },
    },
    maintainAspectRatio: false, // Permettre de définir une taille personnalisée
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Menu de navigation interne */}
        <div className="flex justify-center space-x-4 mb-6">
          <button onClick={() => setActiveTab("revenue")} className={`p-1 px-4 text-sm rounded-lg shadow-lg ${activeTab === "revenue" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Chiffre d'Affaires
          </button>
          <button onClick={() => setActiveTab("gross-margin")} className={`p-1 px-4 text-sm rounded-lg shadow-lg ${activeTab === "gross-margin" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Marge Brute
          </button>
          <button onClick={() => setActiveTab("payroll")} className={`p-1 px-4 text-sm rounded-lg shadow-lg ${activeTab === "payroll" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Masse Salariale
          </button>
          <button onClick={() => setActiveTab("time-consumed")} className={`p-1 px-4 text-sm rounded-lg shadow-lg ${activeTab === "time-consumed" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Temps Consommé
          </button>
          <button onClick={() => setActiveTab("fixed-costs")} className={`p-1 px-4 text-sm rounded-lg shadow-lg ${activeTab === "fixed-costs" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Frais Fixes
          </button>
          <button onClick={() => setActiveTab("operating-result")} className={`p-1 px-4 text-sm rounded-lg shadow-lg ${activeTab === "operating-result" ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700"}`}>
            Résultat Théorique
          </button>
        </div>

        {/* Section Chiffre d'Affaires */}
        {activeTab === "revenue" && (
          <>
            <h1 className="text-3xl font-bold flex items-center mb-6">
              <FaChartLine className="text-blue-700 mr-2" /> Chiffre d'Affaires
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center mb-6">
              <h2 className="text-xl font-semibold">Chiffre d'Affaires Total</h2>
              <p className="text-3xl text-blue-600 font-bold">{revenue.toLocaleString()} €</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Chiffre d'Affaires par Collaborateur</h2>

            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {revenueByCollaborator.map((collab) => (
                <div key={collab._id} className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                  <FaUserTie className="text-blue-600 text-3xl" />
                  <div>
                    <h3 className="text-lg font-semibold">{collab.firstName} {collab.lastName}</h3>
                    <p className="text-xl text-blue-600 font-bold">{collab.revenue.toLocaleString()} €</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Section Marge Brute */}
        {activeTab === "gross-margin" && (
          <>
            <h1 className="text-3xl font-bold flex items-center mb-6">
              <FaEuroSign className="text-green-700 mr-2" /> Marge Brute
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center mb-6">
              <h2 className="text-xl font-semibold">Marge Brute Totale</h2>
              <p className="text-3xl text-green-600 font-bold">{grossMargin.toLocaleString()} €</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Marge Brute par Collaborateur</h2>

            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {marginByCollaborator.map((collab) => (
                <div key={collab._id} className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                  <FaUserTie className="text-green-600 text-3xl" />
                  <div>
                    <h3 className="text-lg font-semibold">{collab.firstName} {collab.lastName}</h3>
                    <p className="text-xl text-green-600 font-bold">{collab.margin.toLocaleString()} €</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Section Masse Salariale */}
        {activeTab === "payroll" && (
          <>
            <h1 className="text-3xl font-bold flex items-center mb-6">
              <FaMoneyBillWave className="text-red-700 mr-2" /> Masse Salariale
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center mb-6">
              <h2 className="text-xl font-semibold">Masse Salariale Totale</h2>
              <p className="text-3xl text-red-600 font-bold">{totalPayroll.toLocaleString()} €</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Masse Salariale par Collaborateur</h2>

            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {payrollByCollaborator
                .filter(collab => collab.cost !== undefined && collab.cost !== null) // Exclure les collaborateurs sans coût défini
                .map((collab) => (
                  <div key={collab._id} className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
                    <FaUserTie className="text-red-600 text-3xl" />
                    <div>
                      <h3 className="text-lg font-semibold">{collab.firstName} {collab.lastName}</h3>
                      <p className="text-xl text-red-600 font-bold">{collab.cost.toLocaleString()} €</p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* Section Temps Consommé */}
        {activeTab === "time-consumed" && (
          <>
            <h1 className="text-3xl font-bold flex items-center mb-6">
              <FaClock className="text-purple-700 mr-2" /> Temps Consommé
            </h1>

            <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {timeByCollaborator.map((collab) => {
                const totalAvailableTime = collab.weeklyHours ? collab.weeklyHours * 47 : 0; // Temps total disponible en heures
                const timeConsumedPercentage = totalAvailableTime ? (collab.totalTimeConsumed / totalAvailableTime) * 100 : 0;
                const barColor = timeConsumedPercentage >= 100 ? "bg-red-600" : "bg-purple-600";
                const displayPercentage = timeConsumedPercentage >= 100 ? 100 : timeConsumedPercentage;

                const clientsCount = clientsByCollaborator.find(c => c._id === collab._id)?.clientsCount || 0;

                return (
                  <div key={collab._id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col space-y-4 relative">
                    <div className="flex items-center space-x-4">
                      <FaUserTie className="text-purple-600 text-3xl" />
                      <div>
                        <h3 className="text-lg font-semibold">{collab.firstName} {collab.lastName}</h3>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <FaBuilding className="text-gray-600 text-lg" /> {/* Utilisation de l'icône FaBuilding */}
                      <span className="text-lg font-semibold">{clientsCount}</span>
                    </div>
                    <div>
                      <h4 className="text-md font-semibold">Temps Consommé :</h4>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className={`${barColor} h-4 rounded-full`} style={{ width: `${displayPercentage}%` }}></div>
                      </div>
                      <p className="text-sm mt-2">{collab.totalTimeConsumed} / {totalAvailableTime} heures</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Section Frais Fixes */}
        {activeTab === "fixed-costs" && (
          <>
            <h1 className="text-3xl font-bold flex items-center mb-6">
              <FaMoneyBillWave className="text-yellow-700 mr-2" /> Frais Fixes
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center mb-6">
              <h2 className="text-xl font-semibold">Total des Frais Fixes</h2>
              <p className="text-3xl text-yellow-600 font-bold">{totalFixedCosts.toLocaleString()} €</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Répartition des Frais Fixes</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: "400px" }}>
                <Pie data={fixedCostsData} options={options} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg" style={{ height: "400px" }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </>
        )}

        {/* Section Résultat d'Exploitation */}
        {activeTab === "operating-result" && (
          <>
            <h1 className="text-3xl font-bold flex items-center mb-6">
              <FaEuroSign className="text-orange-700 mr-2" /> Résultat Théorique
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg text-center mb-6">
              <h2 className="text-xl font-semibold">Résultat d'Exploitation</h2>
              <p className="text-3xl text-orange-600 font-bold">{operatingResult.toLocaleString()} €</p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Détail du Compte de Résultat</h2>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Chiffre d'Affaires Total</span>
                <span>{revenue.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Masse Salariale Totale</span>
                <span>- {totalPayroll.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total des Frais Fixes</span>
                <span>- {totalFixedCosts.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between mt-6 border-t pt-4">
                <span className="font-semibold">Résultat d'Exploitation</span>
                <span className="text-orange-600 font-bold">{operatingResult.toLocaleString()} €</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;