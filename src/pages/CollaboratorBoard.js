import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaUserCircle, FaClipboardList, FaChartPie } from "react-icons/fa";

const CollaboratorBoard = () => {
  const [collaborators, setCollaborators] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user?.role === "collaborateur") return navigate("/timesheet");

    const fetchCollaborators = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/collaborators`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let list = Array.isArray(res.data) ? res.data : res.data.collaborators || [];
        const filtered = list.filter(c => Array.isArray(c.managers) && c.managers.length > 0);
        setCollaborators(filtered);
      } catch (err) {
        console.error("Erreur chargement collaborateurs :", err);
      }
    };

    fetchCollaborators();
  }, [navigate, user]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center w-full">
            Vue des collaborateurs
          </h1>

          {(user?.role === "admin" || user?.role === "expert") && (
            <button
              onClick={() => navigate("/timesheet")}
              className="ml-4 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-sm rounded-lg shadow font-semibold"
            >
              Remplir ma feuille de temps
            </button>
          )}
        </div>

        {collaborators.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Aucun collaborateur avec manager trouvé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {collaborators.map((collab) => (
              <div
                key={collab._id}
                className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center transition-all hover:shadow-lg"
              >
                <FaUserCircle className="text-5xl text-blue-900 mb-3" />
                <div className="text-lg font-semibold text-gray-700 text-center">
                  {collab.firstName} {collab.lastName}
                </div>

                <div className="flex flex-col gap-2 mt-4 w-full">
                  <button
                    onClick={() => navigate(`/timesheet/${collab._id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white text-sm rounded-lg shadow"
                  >
                    <FaClipboardList />
                    Timesheet
                  </button>
                  <button
                    onClick={() => navigate(`/stats/${collab._id}`)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg shadow"
                  >
                    <FaChartPie />
                    Statistiques
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorBoard;
