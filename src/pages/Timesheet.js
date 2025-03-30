import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Timesheet = () => {
  const [clients, setClients] = useState([]);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [form, setForm] = useState({
    client: "",
    task: "",
    comment: "",
    startTime: "",
    endTime: "",
    facturable: false,
    montant: ""
  });

  const [editIndex, setEditIndex] = useState(null);
  const [lockedDates, setLockedDates] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const isCollaborateur = user?.role === "collaborateur";
        const collaboratorId = user?.collaboratorId;
  
        let url = `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/${selectedDate}`;
        if (!isCollaborateur && collaboratorId) {
          url += `?collaboratorId=${collaboratorId}`;
        }
  
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setEntriesByDate(prev => ({
          ...prev,
          [selectedDate]: res.data.entries || [],
        }));
  
        setEditIndex(null);
  
        setLockedDates(prev => ({
          ...prev,
          [selectedDate]: res.data.isLocked || false,
        }));
      } catch (err) {
        console.error("Erreur chargement feuille de temps :", err);
      }
    };
  
    fetchEntries();
  }, [selectedDate]);  

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
    const { name, type, checked, value } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleAddOrUpdate = async () => {
    const { client, task, startTime, endTime, comment, facturable, montant } = form;
    if (!client || !task || !startTime || !endTime) return;

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (end <= start) return;

    const duration = (end - start) / 60000;
    const newEntry = {
      client: client === "none" ? null : client,
      task,
      startTime,
      endTime,
      comment,
      duration,
      facturable,
      montant: facturable ? montant : ""
    };

    try {
      const token = localStorage.getItem("token");
      const payload = {
        client,
        task,
        startTime,
        endTime,
        comment,
        duration,
        facturable,
        montant: facturable ? montant : ""
      };
    
      if (editIndex !== null) {
        // 🔁 MODIFICATION d'une ligne existante
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/${selectedDate}/entry/${editIndex}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // ➕ AJOUT d'une nouvelle ligne
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/timesheets`, {
          ...payload,
          date: selectedDate,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    
      // 🔁 Recharger les lignes après ajout/modification
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      setEntriesByDate(prev => ({
        ...prev,
        [selectedDate]: res.data.entries || [],
      }));
    
    } catch (err) {
      console.error("Erreur sauvegarde ligne :", err);
      alert("Erreur lors de l'enregistrement de la ligne.");
    }
    

    setForm({
      client: "",
      task: "",
      comment: "",
      startTime: "",
      endTime: "",
      facturable: false,
      montant: ""
    });

    setEditIndex(null);
  };
  
  const handleToggleLock = async () => {
    const newLockState = !lockedDates[selectedDate];
  
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/${selectedDate}/lock`,
        { lock: newLockState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setLockedDates(prev => ({
        ...prev,
        [selectedDate]: newLockState,
      }));
  
      alert(`Feuille ${newLockState ? "validée" : "déverrouillée"} !`);
    } catch (err) {
      console.error("Erreur validation feuille :", err);
      alert("Erreur lors de la validation.");
    }
  };
  

  const handleEditEntry = (index) => {
    const entry = entries[index];
  
    setForm({
      client: entry.client?._id || entry.client || "none",
      task: entry.task,
      startTime: entry.startTime,
      endTime: entry.endTime,
      comment: entry.comment || "",
      facturable: entry.facturable,
      montant: entry.montant || "",
    });
  
    setEditIndex(index);
  };  
  

  const handleDelete = async (index) => {
    try {
      const token = localStorage.getItem("token");
  
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/${selectedDate}/entry/${index}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // 🔁 Recharger la liste après suppression
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/timesheets/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setEntriesByDate(prev => ({
        ...prev,
        [selectedDate]: res.data.entries || [],
      }));
  
    } catch (err) {
      console.error("Erreur suppression ligne :", err);
      alert("Erreur lors de la suppression.");
    }
  };
  

  const entries = entriesByDate[selectedDate] || [];
  const totalMinutes = entries.reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  const taskOptions = [
    "Saisie", "TVA", "Acomptes IS", "Autres déclarations fiscales",
    "Révision", "Bilan", "Situation", "Prévisionnel", "Paies", "DSN", "Mails",
    "Autres déclarations sociales", "Téléphone", "Juridique", "CAC",
    "Réunion", "Formation", "Entraide", "Rendez-vous", "Autre"
  ];

  const isLocked = lockedDates[selectedDate];


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center w-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Feuille de Temps</h1>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 px-4 py-2 border rounded shadow"
            />
          </div>
          <div className="ml-4">
            <button
              onClick={handleToggleLock}
              
              className={`px-4 py-2 rounded font-semibold ${
                isLocked ? 'bg-gray-500' : 'bg-green-600'
              } text-white`}
            >
              {isLocked ? "Déverrouiller" : "Valider la feuille"}
            </button>
          </div>
        </div>

        {/* Form */}
        {!isLocked && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-2 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <select
                name="client"
                value={form.client}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="" disabled hidden>Client</option>
                <option value="none">Non affectable</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.company}
                  </option>
                ))}
              </select>

              <select
                name="task"
                value={form.task}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="" disabled hidden>Tâche</option>
                {taskOptions.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>

              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="p-2 border rounded"
              />

              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="p-2 border rounded"
              />

              <button
                onClick={handleAddOrUpdate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {editIndex !== null ? "Modifier" : "+ Ajouter"}
              </button>
            </div>

            <input
              type="text"
              name="comment"
              placeholder="Commentaire (facultatif)"
              value={form.comment}
              onChange={handleChange}
              className="p-2 border rounded w-full mt-2 mb-4"
            />

            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="facturable"
                  checked={form.facturable}
                  onChange={handleChange}
                  className="mr-2"
                />
                Facturable
              </label>

              {form.facturable && (
                <input
                  type="number"
                  name="montant"
                  placeholder="Montant HT (€)"
                  value={form.montant}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
              )}
            </div>
          </>
        )}

        {/* Tableau */}
        <div className="bg-white shadow rounded-lg p-4">
          {entries.length === 0 ? (
            <p className="text-center text-gray-500">Aucune entrée pour cette date.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Client</th>
                  <th className="p-2">Tâche</th>
                  <th className="p-2">Début</th>
                  <th className="p-2">Fin</th>
                  <th className="p-2">Durée</th>
                  <th className="p-2">💶</th>
                  {!isLocked && <th className="p-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        {entry.client === "none"
                          ? "Non affectable"
                          : entry.client?.company || "Non affectable"}
                      </td>
                      <td className="p-2">{entry.task}</td>
                      <td className="p-2">{entry.startTime}</td>
                      <td className="p-2">{entry.endTime}</td>
                      <td className="p-2">
                        {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                      </td>
                      <td className="p-2">
                        {entry.facturable && entry.montant ? `${entry.montant} €` : "-"}
                      </td>
                      {!isLocked && (
                        <td className="p-2 text-right space-x-2">
                          <button
                            onClick={() => handleEditEntry(idx)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(idx)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                    {entry.comment && (
                      <tr className="text-sm text-gray-500">
                        <td colSpan={isLocked ? 6 : 7} className="p-2 italic">
                          💬 {entry.comment}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          <div className="text-right mt-4 font-semibold text-lg">
            Total : {totalHours}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timesheet;
