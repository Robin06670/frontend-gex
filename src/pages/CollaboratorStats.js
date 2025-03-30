import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import axios from "axios";

const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const CollaboratorStats = () => {
  const { id } = useParams();
  const [collaborator, setCollaborator] = useState(null);
  const [stats, setStats] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [fromDate, setFromDate] = useState(() => format(new Date(), "yyyy-MM-01"));
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    const fetchCollaboratorAndClients = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCollaborator(userRes.data);

        const clientsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/timesheets/collaborators/${id}/clients`
, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClients(clientsRes.data || []);
        setFilteredClients(clientsRes.data || []);
      } catch (err) {
        console.error("Erreur chargement collaborateur ou clients", err);
      }
    };

    fetchCollaboratorAndClients();
  }, [id]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        let url = `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/stats/${id}?from=${fromDate}&to=${toDate}`;
        if (selectedClientId) {
          url += `&clientId=${selectedClientId}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data || []);
      } catch (err) {
        console.error("Erreur récupération stats :", err);

        // fallback de test
        setStats([]);
      }
    };

    fetchStats();
  }, [id, fromDate, toDate, selectedClientId]);

  const totalMinutes = Array.isArray(stats)
  ? stats.reduce((acc, item) => acc + item.duration, 0)
  : 0;
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  const pieData = stats.reduce((acc, item) => {
    const existing = acc.find(e => e.name === item.task);
    if (existing) {
      existing.value += item.duration;
    } else {
      acc.push({ name: item.task, value: item.duration });
    }
    return acc;
  }, []);

  const barData = [
    {
      name: "Facturation",
      Facturable: stats.filter(s => s.facturable).reduce((acc, s) => acc + s.duration, 0),
      NonFacturable: stats.filter(s => !s.facturable).reduce((acc, s) => acc + s.duration, 0),
    },
  ];

  const openModal = () => {
    setClientModalOpen(true);
    setSearchTerm("");
    setFilteredClients(clients);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = clients.filter(c =>
      c.name.toLowerCase().includes(term) || c.activity?.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center w-full md:w-auto">
            Statistiques – {collaborator ? `${collaborator.firstName} ${collaborator.lastName}` : "Chargement..."}
          </h1>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={openModal}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded shadow"
            >
              Filtrer par client
            </button>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-1 border rounded"
            />
            <span>→</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div className="text-right mb-6 font-semibold text-lg text-gray-700">
          Total : {totalHours}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Répartition par tâche</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Heures facturables</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Facturable" fill="#3b82f6" />
                <Bar dataKey="NonFacturable" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MODALE DE SÉLECTION CLIENT */}
        {clientModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Sélectionner un client</h3>

              <input
                type="text"
                placeholder="Rechercher un client"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full mb-4 px-3 py-2 border rounded"
              />

              <button
                onClick={() => {
                  setSelectedClientId(null);
                  setClientModalOpen(false);
                }}
                className="text-sm mb-4 text-blue-700 hover:underline"
              >
                ❌ Aucun filtre (vue globale)
              </button>

              <ul className="space-y-2">
                {filteredClients.map((client) => (
                  <li
                    key={client._id}
                    className="cursor-pointer hover:bg-blue-50 p-2 rounded text-gray-700"
                    onClick={() => {
                      setSelectedClientId(client._id);
                      setClientModalOpen(false);
                    }}
                  >
                    {client.name} {client.activity && `(${client.activity})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorStats;
