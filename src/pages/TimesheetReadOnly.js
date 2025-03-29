import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useParams } from "react-router-dom";
import { format, parseISO, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

const TimesheetReadOnly = () => {
  const { id } = useParams();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date());
  const [collaborator, setCollaborator] = useState(null);

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/timesheets/collaborator/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEntries(res.data || []);
        setCollaborator(userRes.data);
      } catch (err) {
        console.error("Erreur récupération timesheet :", err);
      }
    };

    fetchTimesheet();
  }, [id]);

  const handleDateChange = (e) => {
    setDate(new Date(e.target.value));
  };

  const filteredEntries = entries.filter((entry) =>
    isSameDay(parseISO(entry.date), date)
  );

  const totalDuration = filteredEntries.reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMinutes = totalDuration % 60;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Feuille de Temps - {collaborator ? `${collaborator.firstName} ${collaborator.lastName}` : "Chargement..."}
        </h1>

        <div className="flex justify-center mb-6">
          <input
            type="date"
            value={format(date, "yyyy-MM-dd")}
            onChange={handleDateChange}
            className="border px-4 py-2 rounded shadow"
          />
        </div>

        {filteredEntries.length === 0 ? (
          <p className="text-center text-gray-500">Aucune entrée pour cette date.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm">
                  <th className="py-3 px-4 text-left">Client</th>
                  <th className="py-3 px-4 text-left">Tâche</th>
                  <th className="py-3 px-4 text-left">Début</th>
                  <th className="py-3 px-4 text-left">Fin</th>
                  <th className="py-3 px-4 text-left">Durée</th>
                  <th className="py-3 px-4 text-left">Commentaire</th>
                  <th className="py-3 px-4 text-left">Facturable</th>
                  <th className="py-3 px-4 text-left">Montant (€)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={index} className="border-t text-sm text-gray-700">
                    <td className="py-2 px-4">{entry.clientName || "Non affectable"}</td>
                    <td className="py-2 px-4">{entry.task}</td>
                    <td className="py-2 px-4">{entry.start}</td>
                    <td className="py-2 px-4">{entry.end}</td>
                    <td className="py-2 px-4">{Math.floor(entry.duration / 60)}h {entry.duration % 60}m</td>
                    <td className="py-2 px-4">{entry.comment || "-"}</td>
                    <td className="py-2 px-4">{entry.billable ? "Oui" : "Non"}</td>
                    <td className="py-2 px-4">{entry.billableAmount ? `${entry.billableAmount} €` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-4 text-gray-700 font-semibold pr-4">
              Total : {totalHours}h {totalMinutes}m
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetReadOnly;
