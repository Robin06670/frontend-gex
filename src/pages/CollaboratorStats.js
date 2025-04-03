import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Sector } from "recharts";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import { format } from "date-fns";
import axios from "axios";

const COLORS = ["#4f46e5", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, midAngle,
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const { task, amount, duration } = payload[0].payload;
    const h = Math.floor(duration / 60);
    const m = duration % 60;
    return (
      <div style={{
        background: "white",
        border: "1px solid #ccc",
        padding: "8px 12px",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        fontSize: "14px",
        color: "#333"
      }}>
        <div><strong>{task}</strong></div>
        <div>{h}h {m > 0 ? `${m}m` : ""}</div>
        <div>{amount.toFixed(2)} €</div>
      </div>
    );
  }
  return null;
};

const CollaboratorStats = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [collaborator, setCollaborator] = useState(null);
  const [stats, setStats] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);
  const [fromDate, setFromDate] = useState(() => format(new Date(), "yyyy-MM-01"));
  const [toDate, setToDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [activeIndex, setActiveIndex] = useState(null);
  const [barHoverIndex, setBarHoverIndex] = useState(null);

  useEffect(() => {
    const fetchCollaboratorAndClients = async () => {
      try {
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
        let url = `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/stats/${id}?from=${fromDate}&to=${toDate}`;
        if (selectedClientId) {
          url += `&client=${selectedClientId}`; // ✅ correct
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🔄 Réponse de l'API :", res.data);

        setStats(res.data.timesheets || []);
        setTotalDuration(res.data.total || 0);
      } catch (err) {
        console.error("Erreur récupération stats :", err?.response?.data || err.message || err);
        console.log("📦 stats reçues :", stats);

        // fallback de test
        setStats([]);
      }
    };

    fetchStats();
  }, [id, fromDate, toDate, selectedClientId]);

  const totalMinutes = Array.isArray(stats)
  ? stats.reduce((acc, item) => acc + item.duration, 0)
  : 0;
  const selectedClient = clients.find(c => c._id === selectedClientId);
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

  const billedData = stats
  .filter(s => s.facturable && s.amount) // Ne garder que les lignes facturables
  .reduce((acc, entry) => {
    const existing = acc.find(e => e.task === entry.task);
    if (existing) {
      existing.amount += entry.amount;
      existing.duration += entry.duration;
    } else {
      acc.push({
        task: entry.task,
        amount: entry.amount,
        duration: entry.duration,
      });
    }
    return acc;
  }, []);

  const visibleClients = selectedClientId
  ? clients.filter(c => c._id === selectedClientId)
  : clients;

  const clientSummaries = visibleClients.map(client => {
    const clientEntries = stats.filter(s => s.client === client._id); // ✅ fonctionne si client est string
  
    const totalDuration = clientEntries.reduce((acc, s) => acc + s.duration, 0);
    const totalBilled = clientEntries
      .filter(s => s.facturable)
      .reduce((acc, s) => acc + (s.amount || 0), 0);
  
    return {
      company: client.company,
      duration: totalDuration,
      billed: totalBilled,
      fees: client.fees || 0,
      theoreticalTime: client.theoreticalTime || 0,
    };
  });
  
  

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
    const filtered = clients.filter(c =>
      c.company?.toLowerCase().includes(term) || c.activity?.toLowerCase().includes(term)
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

        <div className="flex items-center justify-between mb-6 px-4">
          {selectedClient ? (
            <div className="text-center text-lg font-semibold text-gray-800 mx-auto">
              {selectedClient.company}
            </div>
          ) : (
            <div></div> // espace vide pour équilibrer
          )}
          <div className="text-right font-semibold text-lg text-gray-700 whitespace-nowrap">
            Total : {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Répartition par tâche</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                isAnimationActive={true}
                activeShape={renderActiveShape}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                labelLine={false}        // enlève les traits noirs
                label={({ value }) => {
                  const h = Math.floor(value / 60);
                  const m = value % 60;
                  return m === 0 ? `${h}h` : `${h}h ${m}m`;
                }}                
              >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const task = payload[0].name || payload[0].payload.name;
                      return (
                        <div style={{
                          background: "white",
                          border: "1px solid #ccc",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          fontSize: "14px",
                          color: "#333"
                        }}>
                          {task}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Montants facturables par tâche</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={billedData}>
              <XAxis
                dataKey="task"
                angle={-20}
                textAnchor="end"
                interval={0}
                height={60}
                tick={{ fontSize: 12 }}
              />

                <YAxis />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="amount">
                  {billedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        barHoverIndex === index
                          ? "#4338ca" // couleur foncée au survol
                          : COLORS[index % COLORS.length]
                      }
                      onMouseEnter={() => setBarHoverIndex(index)}
                      onMouseLeave={() => setBarHoverIndex(null)}
                    />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Récapitulatif par client</h2>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow overflow-hidden">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-sm text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Client</th>
                <th className="text-right px-6 py-3">Temps total</th>
                <th className="text-right px-6 py-3">Temps théorique</th>
                <th className="text-right px-6 py-3">Montant facturable</th>
                <th className="text-right px-6 py-3">Honoraires théoriques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
              {clientSummaries.map((c, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition-all">
                  <td className="px-6 py-4 font-medium">{c.company}</td>
                  <td className="text-right px-6 py-4">
                    {Math.floor(c.duration / 60)}h {c.duration % 60}m
                  </td>
                  <td className="text-right px-6 py-4">{c.theoreticalTime}h</td>
                  <td className="text-right px-6 py-4">{c.billed.toFixed(2)} €</td>
                  <td className="text-right px-6 py-4">{c.fees.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e);
                }}
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
              {filteredClients.map(client => (
                <li
                  key={client._id}
                  className="cursor-pointer hover:bg-blue-50 p-2 rounded text-gray-700"
                  onClick={() => {
                    setSelectedClientId(client._id);
                    setClientModalOpen(false);
                  }}
                >
                  {client.company} {client.activity && `(${client.activity})`}
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
