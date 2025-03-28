import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Timesheet = () => {
  const [clients, setClients] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    date: "",
    client: "",
    task: "",
    duration: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));

  // Charger les clients à l'initialisation
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = user?.role === "collaborateur"
          ? res.data.filter(client => {
              const collabId = client.collaborator?._id || client.collaborator;
              return collabId === user.collaboratorId;
            })
          : res.data;

        setClients(filtered);
      } catch (err) {
        console.error("Erreur chargement clients", err);
      }
    };

    fetchClients();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEntry = () => {
    if (!form.date || !form.client || !form.task || !form.duration) return;
    setEntries([...entries, form]);
    setForm({ date: "", client: "", task: "", duration: "" });
  };

  const totalMinutes = entries.reduce((acc, curr) => acc + parseInt(curr.duration), 0);
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Feuille de Temps</h1>

        {/* Formulaire de saisie */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input type="date" name="date" value={form.date} onChange={handleChange}
            className="p-2 border rounded w-full" />

          <select name="client" value={form.client} onChange={handleChange}
            className="p-2 border rounded w-full">
            <option value="">Sélectionner un client</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>
                {client.company}
              </option>
            ))}
          </select>

          <input type="text" name="task" placeholder="Tâche réalisée"
            value={form.task} onChange={handleChange}
            className="p-2 border rounded w-full" />

          <input type="number" name="duration" placeholder="Durée (min)"
            value={form.duration} onChange={handleChange}
            className="p-2 border rounded w-full" />
        </div>

        <button onClick={handleAddEntry}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          + Ajouter
        </button>

        {/* Tableau des entrées */}
        <div className="bg-white shadow rounded p-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Client</th>
                <th className="p-2 text-left">Tâche</th>
                <th className="p-2 text-left">Durée</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{entry.date}</td>
                  <td className="p-2">{clients.find(c => c._id === entry.client)?.company || "?"}</td>
                  <td className="p-2">{entry.task}</td>
                  <td className="p-2">{entry.duration} min</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right mt-4 font-semibold text-lg">
            Total : {totalHours}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timesheet;
